"""
Plugin manager for CropGuard AI.

Manages the enabled/disabled state of all
plugins and provides methods for the agent
to check which tools are available.

Plugin states are stored per user session
in Redis so each farmer can have their own
plugin configuration that persists between
page reloads.

Usage:
    from plugins import PluginManager
    
    # Create manager for a user
    manager = PluginManager(user_id="user123")
    
    # Check if plugin is active
    if manager.is_enabled("weather_tool"):
        weather = await get_weather(location)
    
    # Enable/disable plugins
    manager.enable("weather_tool")
    manager.disable("weather_tool")
    
    # Get all plugin states for UI
    plugins = manager.get_all_plugins()
"""

# backend/plugins/manager.py
import json
import logging
from typing import Optional
from plugins.registry import PLUGIN_REGISTRY

logger = logging.getLogger(__name__)

# Redis key prefix for plugin settings
PLUGIN_KEY_PREFIX = "plugins"


class PluginManager:
    """
    Manages plugin states for a specific user.

    Stores plugin enabled/disabled states in Redis
    so settings persist across page reloads but
    reset if Redis is cleared.

    Falls back to registry defaults if Redis
    is not available or no user settings found.

    Attributes:
        user_id: Farmer's user ID (or "anonymous")
        redis: Redis client instance (optional)

    Example:
        manager = PluginManager("user123")

        if manager.is_enabled("weather_tool"):
            weather = await get_weather(location)
    """

    def __init__(
        self,
        user_id: Optional[str] = None
    ):
        """
        Initialise plugin manager for a user.

        Redis is optional — plugins work without it
        using default states from registry.

        Args:
            user_id: Farmer's user ID.
                     Uses "anonymous" if not provided.
        """
        self.user_id = user_id or "anonymous"
        self.redis = None
        self._redis_key = (
            f"{PLUGIN_KEY_PREFIX}:{self.user_id}"
        )

        # Try to connect to Redis but don't fail
        # if it is not available
        try:
            from database.redis_client import get_redis
            self.redis = get_redis()
            logger.debug(
                f"PluginManager Redis connected "
                f"for user: {self.user_id}"
            )
        except Exception as e:
            logger.warning(
                f"Redis unavailable for plugins: {e}. "
                f"Using default plugin states."
            )

    # ── State Loading ──────────────────────────────────────

    def _load_states(self) -> dict[str, bool]:
        """
        Load plugin states from Redis.

        Falls back to registry defaults if Redis
        is unavailable or no user settings stored.

        Returns:
            dict: Plugin ID to enabled bool mapping
        """
        # Try Redis first
        if self.redis:
            try:
                data = self.redis.get(self._redis_key)
                if data:
                    return json.loads(data)
            except Exception as e:
                logger.warning(
                    f"Failed to load plugin states "
                    f"from Redis: {e}. Using defaults."
                )

        # Return defaults from registry
        return {
            plugin["id"]: plugin["enabled"]
            for plugin in PLUGIN_REGISTRY
        }

    def _save_states(
        self,
        states: dict[str, bool]
    ) -> None:
        """
        Save plugin states to Redis.

        Silently skips if Redis is not available.

        Args:
            states: Plugin ID to enabled bool mapping
        """
        if not self.redis:
            logger.debug(
                "Redis unavailable — "
                "plugin states not persisted"
            )
            return

        try:
            # Store for 30 days
            self.redis.setex(
                self._redis_key,
                30 * 24 * 3600,
                json.dumps(states)
            )
        except Exception as e:
            logger.warning(
                f"Failed to save plugin states: {e}"
            )

    # ── Plugin Control ─────────────────────────────────────

    def is_enabled(self, plugin_id: str) -> bool:
        """
        Check if a specific plugin is enabled.

        Always returns True for required plugins
        regardless of the stored state.

        Args:
            plugin_id: Plugin identifier to check

        Returns:
            bool: True if plugin is active

        Example:
            if manager.is_enabled("weather_tool"):
                weather = await get_weather(location)
        """
        # Required plugins are always enabled
        plugin_def = next(
            (p for p in PLUGIN_REGISTRY
             if p["id"] == plugin_id),
            None
        )

        if plugin_def and plugin_def.get("required"):
            return True

        states = self._load_states()
        return states.get(plugin_id, True)

    def enable(self, plugin_id: str) -> bool:
        """
        Enable a specific plugin.

        Args:
            plugin_id: Plugin identifier to enable

        Returns:
            bool: True if successfully enabled
        """
        states = self._load_states()

        if plugin_id not in states:
            logger.warning(
                f"Plugin not found: {plugin_id}"
            )
            return False

        states[plugin_id] = True
        self._save_states(states)

        logger.info(f"Plugin enabled: {plugin_id}")
        return True

    def disable(self, plugin_id: str) -> bool:
        """
        Disable a specific plugin.

        Required plugins cannot be disabled.

        Args:
            plugin_id: Plugin identifier to disable

        Returns:
            bool: True if disabled successfully
        """
        # Prevent disabling required plugins
        plugin_def = next(
            (p for p in PLUGIN_REGISTRY
             if p["id"] == plugin_id),
            None
        )

        if not plugin_def:
            logger.warning(
                f"Plugin not found: {plugin_id}"
            )
            return False

        if plugin_def.get("required"):
            logger.warning(
                f"Cannot disable required plugin: "
                f"{plugin_id}"
            )
            return False

        states = self._load_states()
        states[plugin_id] = False
        self._save_states(states)

        logger.info(f"Plugin disabled: {plugin_id}")
        return True

    def toggle(self, plugin_id: str) -> bool:
        """
        Toggle a plugin between enabled and disabled.

        Args:
            plugin_id: Plugin identifier to toggle

        Returns:
            bool: New state after toggling

        Example:
            new_state = manager.toggle("weather_tool")
            print(new_state)  # False (was True)
        """
        current = self.is_enabled(plugin_id)
        if current:
            self.disable(plugin_id)
            return False
        else:
            self.enable(plugin_id)
            return True

    # ── Plugin Info ────────────────────────────────────────

    def get_all_plugins(self) -> list[dict]:
        """
        Get all plugins with their current states.

        Returns full plugin information including
        current enabled state for displaying in
        the frontend PluginManager.tsx component.

        Returns:
            list[dict]: All plugins with current
                        enabled state merged in
        """
        try:
            states = self._load_states()

            result = []
            for plugin in PLUGIN_REGISTRY:
                plugin_copy = plugin.copy()

                # Required plugins always show enabled
                if plugin.get("required"):
                    plugin_copy["enabled"] = True
                else:
                    plugin_copy["enabled"] = states.get(
                        plugin["id"],
                        plugin["enabled"]
                    )

                result.append(plugin_copy)

            return result

        except Exception as e:
            logger.error(
                f"get_all_plugins error: {e}. "
                f"Returning registry defaults."
            )
            return list(PLUGIN_REGISTRY)

    def get_active_plugins(self) -> list[str]:
        """
        Get list of currently enabled plugin IDs.

        Used by the agent to know which tools
        to include in the workflow.

        Returns:
            list[str]: IDs of all active plugins
        """
        return [
            plugin["id"]
            for plugin in PLUGIN_REGISTRY
            if self.is_enabled(plugin["id"])
        ]

    def reset_to_defaults(self) -> None:
        """
        Reset all plugins to their default states
        as defined in the registry.
        """
        if not self.redis:
            logger.warning(
                "Redis unavailable — "
                "cannot reset plugin states"
            )
            return

        try:
            self.redis.delete(self._redis_key)
            logger.info(
                f"Plugins reset to defaults "
                f"for user: {self.user_id}"
            )
        except Exception as e:
            logger.error(
                f"Failed to reset plugins: {e}"
            )