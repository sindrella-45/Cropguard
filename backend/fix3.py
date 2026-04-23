lines = open('agent/graph.py', encoding='utf-8').readlines()
# Find and remove the orphaned logger.info( and ) lines around our new code
result = []
skip_next = False
for i, line in enumerate(lines):
    if skip_next:
        skip_next = False
        continue
    # Remove orphaned "        logger.info(\n" followed by our new tokens line
    if line.strip() == 'logger.info(' and i+1 < len(lines) and 'tokens = final_state' in lines[i+1]:
        skip_next = False
        continue
    # Remove orphaned closing "        )\n" after our logger.info(f"...tokens...") line
    if line.strip() == ')' and i > 0 and 'logger.info(f"Agent run complete' in lines[i-1]:
        continue
    result.append(line)
open('agent/graph.py', 'w', encoding='utf-8').writelines(result)
print("done", len(lines), "->", len(result))
