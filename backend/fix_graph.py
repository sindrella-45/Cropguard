import re
content = open('agent/graph.py', encoding='utf-8').read()
# Replace the problematic logger and return lines
content = re.sub(
    r'        logger\.info\(\s*f"Agent run complete: tokens=\{final_state.*?\}\s*\)\s*return final_state.*?or \{\}',
    '        tokens = final_state.get("tokens_used", 0) if isinstance(final_state, dict) else getattr(final_state, "tokens_used", 0)\n        logger.info(f"Agent run complete: tokens={tokens}")\n        fr = final_state.get("final_response") if isinstance(final_state, dict) else getattr(final_state, "final_response", None)\n        return fr or {}',
    content,
    flags=re.DOTALL
)
open('agent/graph.py', 'w', encoding='utf-8').write(content)
print("done")
