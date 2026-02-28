import os

files_to_update = [
    'content.html',
    'resume.html',
    'find-the-way-home.html',
    'into-the-unknown.html',
    'adventure-of.html',
    'pizza-delivery.html',
    'shaman.html',
    'echo.html',
    'deep-space.html',
    'playdate-demo.html'
]

minimal_footer = '''    <!-- FOOTER MINIMAL -->
    <div class="footer-minimal" style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 40px 0; margin-top: 80px; font-family: 'Google Sans', sans-serif;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
        <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">
          <strong style="color: #fff; font-size: 16px; margin-right: 20px;">Zoey Liu</strong>
          <a href="mailto:ziyu.liu@duke.edu" style="color: inherit; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.6'" onmouseout="this.style.opacity='1'">ziyu.liu@duke.edu</a>
        </div>
        <div style="display: flex; gap: 24px; align-items: center; color: rgba(255, 255, 255, 0.6); font-size: 14px;">
          <a href="https://www.linkedin.com/in/zoey-liu2002" target="_blank" style="color: inherit; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255, 255, 255, 0.6)'">LinkedIn</a>
          <a href="resume.html" style="color: inherit; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255, 255, 255, 0.6)'">Resume</a>
          <span>© 2026 Zoey Liu. All Rights Reserved.</span>
        </div>
      </div>
    </div>'''

for fname in files_to_update:
    path = os.path.join('/Users/liuziyu/Desktop/zoeyliu-portfolio-0205.webflow', fname)
    if not os.path.exists(path):
        print(f"File {fname} does not exist.")
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    start_str = '<!-- FOOTER'
    # Find the closing tag of the major block. 
    # Usually ends with: <div class="line-horizontal"></div>\n      </section>\n    </div>
    # I'll just look for '<div class="line-horizontal"></div>\n      </section>\n    </div>'
    end_strs = [
        '<div class="line-horizontal"></div>\n      </section>\n    </div>',
        '<div class="line-horizontal"></div>\r\n      </section>\r\n    </div>',
        '<div class="line-horizontal"></div>\n        </section>\n    </div>',
        '<div class="line-horizontal"></div>\n        </section>\n      </div>'
    ]
    
    start_idx = content.find(start_str)
    if start_idx != -1:
        end_idx = -1
        matched_str = ""
        for end_str in end_strs:
            idx = content.find(end_str, start_idx)
            if idx != -1:
                end_idx = idx
                matched_str = end_str
                break
                
        if end_idx != -1:
            end_idx += len(matched_str)
            new_content = content[:start_idx] + minimal_footer + content[end_idx:]
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {fname}")
        else:
            print(f"End not found in {fname}")
    else:
        print(f"Start not found in {fname}")
