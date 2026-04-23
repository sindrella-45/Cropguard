lines = open('routes/analyze.py', encoding='utf-8').readlines()
for i, line in enumerate(lines):
    if '        if "diagnosis_id" not in result or not result["diagnosis_id"]:' in line:
        lines[i] = '        # diagnosis_id is injected by graph.py from save_memory node\n'
    elif '            result["diagnosis_id"] = result.get("diagnosis_id")' in line:
        lines[i] = '        result["session_id"] = session_id\n'
open('routes/analyze.py', 'w', encoding='utf-8').writelines(lines)
print("done")
