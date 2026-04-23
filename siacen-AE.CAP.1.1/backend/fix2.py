lines = open('agent/graph.py', encoding='utf-8').readlines()
for i, line in enumerate(lines):
    if 'Agent run complete: tokens=' in line:
        lines[i] = '        tokens = final_state.get("tokens_used", 0) if isinstance(final_state, dict) else getattr(final_state, "tokens_used", 0)\n        logger.info(f"Agent run complete: tokens={tokens}")\n'
    elif 'return final_state.get("final_response")' in line or 'return final_state.final_response' in line:
        lines[i] = '        fr = final_state.get("final_response") if isinstance(final_state, dict) else getattr(final_state, "final_response", None)\n        return fr or {}\n'
open('agent/graph.py', 'w', encoding='utf-8').writelines(lines)
print("done")
