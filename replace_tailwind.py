import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    def repl(m):
        prefix = m.group(1)
        value = m.group(2)
        
        if prefix.endswith('shadow'):
            if value == 'shadow':
                return f"{prefix}-admin"
            elif value.startswith('shadow-'):
                return f"{prefix}-admin-{value.split('shadow-')[1]}"
            else:
                return f"{prefix}-admin-{value}"
        else:
            return f"{prefix}-admin-{value}"

    new_content = re.sub(r'([a-z:\-]+)-\[var\(--admin-([a-zA-Z0-9\-]+)\)\]', repl, content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js', '.jsx')):
            replace_in_file(os.path.join(root, file))
