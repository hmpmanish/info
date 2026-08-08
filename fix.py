import re
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
# Remove the <a href="#">...</a> lines inside the project overlay
c = re.sub(r'\s*<a href="#" class="project-link.*?><i class="fas fa-eye"></i></a>', '', c)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)
