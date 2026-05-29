lines = open('routes/analyze.py', encoding='utf-8').readlines()
for i, line in enumerate(lines):
    if '        return result' in line:
        lines[i] = (
            '        result["session_id"] = session_id\n'
            '        if "diagnosis_id" not in result or not result["diagnosis_id"]:\n'
            '            result["diagnosis_id"] = result.get("diagnosis_id")\n'
            '        return result\n'
        )
        break
open('routes/analyze.py', 'w', encoding='utf-8').writelines(lines)
print("done")
