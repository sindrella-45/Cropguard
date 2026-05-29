lines = open('agent/graph.py', encoding='utf-8').readlines()
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    # Replace everything between ainvoke and except with clean code
    if '        fr = final_state' in line or '        diag_id = final_state' in line or '        tokens = final_state' in line or "logger.info(f\"Agent run complete" in line or '        return fr or {}' in line or '        if fr and diag_id' in line or "fr[\"diagnosis_id\"]" in line or '        # final_state is' in line or '        # diagnosis_id is set' in line:
        i += 1
        continue
    new_lines.append(line)
    i += 1

# Now insert clean return logic after ainvoke block
result = []
for i, line in enumerate(new_lines):
    result.append(line)
    if '            initial_state' in line and i+1 < len(new_lines) and ')' in new_lines[i+1]:
        pass
    if line.strip() == ')' and i > 0 and 'initial_state' in new_lines[i-1]:
        result.append('        state = final_state if isinstance(final_state, dict) else vars(final_state)\n')
        result.append('        tokens = state.get("tokens_used", 0)\n')
        result.append('        logger.info(f"Agent run complete: tokens={tokens}")\n')
        result.append('        fr = state.get("final_response") or {}\n')
        result.append('        fr["diagnosis_id"] = state.get("diagnosis_id")\n')
        result.append('        fr["session_id"] = state.get("session_id")\n')
        result.append('        return fr\n')

open('agent/graph.py', 'w', encoding='utf-8').writelines(result)
print("done")
