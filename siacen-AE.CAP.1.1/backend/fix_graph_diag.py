lines = open('agent/graph.py', encoding='utf-8').readlines()
for i, line in enumerate(lines):
    if '        return fr or {}' in line:
        lines[i] = (
            '        diag_id = final_state.get("diagnosis_id") if isinstance(final_state, dict) else getattr(final_state, "diagnosis_id", None)\n'
            '        if fr and diag_id and not fr.get("diagnosis_id"):\n'
            '            fr["diagnosis_id"] = diag_id\n'
            '        return fr or {}\n'
        )
        break
open('agent/graph.py', 'w', encoding='utf-8').writelines(lines)
print("done")
