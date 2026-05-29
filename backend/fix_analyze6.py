lines = open('routes/analyze.py', encoding='utf-8').readlines()
for i, line in enumerate(lines):
    if '        return result' in line and i > 50:
        lines.insert(i, '        logger.info(f"diagnose_id in result: {result.get(\'diagnosis_id\')} session_id: {session_id}")\n')
        break
open('routes/analyze.py', 'w', encoding='utf-8').writelines(lines)
print("done")
