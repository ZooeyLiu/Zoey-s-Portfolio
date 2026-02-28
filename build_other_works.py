import json

with open('other-works-manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# Sort series conceptually if needed (leave as is for now)

series_html = ""
for i, series in enumerate(manifest['series']):
    title = series['title']
    tags = series['tags'][0]
    
    # We want up to 4 images for the mosaic: 1 large top banner, 3 small below.
    # Actually my design was 1 large spanning 3 cols, and up to 3 small.
    # We'll just take the first 4 images.
    images = series['files']
    display_images = images[:4]
    
    mosaic_html = ""
    for idx, img in enumerate(display_images):
        mosaic_html += f'''
                    <div class="series-img-box">
                        <img src="{img['path']}" loading="lazy" alt="{img['type']}">
                    </div>'''
                    
    # The gallery array for the lightbox
    gallery_arr = json.dumps([img['path'] for img in images]).replace('"', '&quot;')
    
    series_html += f'''
            <div class="series-card fade-in">
                <div class="series-header">
                    <h3 class="series-title">{title}</h3>
                    <span class="series-tag">{tags}</span>
                </div>
                <div class="series-mosaic">
                    {mosaic_html}
                </div>
                <button class="btn-view-series" data-gallery="{gallery_arr}">View Series ({len(images)} items)</button>
            </div>'''

poster_html = ""
for poster in manifest['posters']:
    path = poster['path']
    poster_html += f'''
            <div class="poster-item" data-src="{path}">
                <img src="{path}" loading="lazy" alt="Graphic Poster">
            </div>'''
            

html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Other Works - Zoey Liu</title>
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <link href="css/normalize.css" rel="stylesheet" type="text/css">
  <link href="css/webflow.css" rel="stylesheet" type="text/css">
  <link href="css/zoeyliu-portfolio-0205.webflow.css" rel="stylesheet" type="text/css">
  <link href="css/other-works.css" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin="anonymous">
  <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
  <script type="text/javascript">WebFont.load({{ google: {{ families: ["Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic", "Varela:400", "Inter Tight:300,400,500,600,700"] }} }});</script>
</head>

<body class="body-5">
  <!-- NAVBAR -->
  <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" class="navbar-3 w-nav">
    <div class="nav-container-lines">
      <div class="nav-container">
        <a href="index.html" class="nav-logo w-nav-brand">
          <img width="170" sizes="170px" alt="Logo" src="images/ChatGPT-Image-2026年1月20日-13_23_09.png" class="image-15">
          <div class="navigation-line"></div>
        </a>
        <nav role="navigation" class="nav-menu w-nav-menu">
          <a href="index.html" class="navigation-link w-nav-link">Home</a>
          <a href="index.html#projects-fan" class="navigation-link w-nav-link">Work</a>
          <a href="resume.html" class="navigation-link w-nav-link">Resume</a>
          <a href="mailto:ziyu.liu@duke.edu" class="navigation-link w-nav-link">Contact</a>
        </nav>
        <div class="nav-button-group">
          <a href="index.html" class="button-secondary-4 w-inline-block">
            <div class="button-5"><div>ZOEY.LIU</div></div>
            <div class="button-background"><div class="button-bg w-embed"><style>.button-secondary {{ background: rgba(255, 255, 255, 0.12); }}</style></div></div>
          </a>
          <div class="menu-button w-nav-button"><div class="w-icon-nav-menu"></div></div>
        </div>
      </div>
      <div class="lines-group">
        <div class="line-vertical-left"></div>
        <div class="line-vertical-right"></div>
        <div class="line-dot bottom-left"></div>
        <div class="line-dot bottom-right"></div>
      </div>
    </div>
  </div>

  <!-- HERO -->
  <header class="hero-others">
      <h1>Other Works</h1>
      <p>A collection of graphic systems, event branding, and poster designs.</p>
  </header>

  <!-- FEATURED CAMPAIGNS -->
  <section class="section-others" id="featured-series">
      <h2 class="section-title">Featured Campaigns & Systems</h2>
      <div class="series-grid">
{series_html}
      </div>
  </section>

  <!-- POSTER WALL -->
  <section class="section-others" id="poster-wall">
      <h2 class="section-title">Poster Collection</h2>
      <div class="poster-wall">
{poster_html}
      </div>
  </section>

  <!-- FOOTER MINIMAL -->
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
  </div>

  <!-- LIGHTBOX -->
  <div class="lightbox-modal" id="lightbox-modal">
      <div class="lightbox-close" id="lightbox-close">&times;</div>
      <div class="lightbox-nav lightbox-prev" id="lightbox-prev">&#10094;</div>
      <img class="lightbox-img" id="lightbox-img" src="" alt="Expanded View">
      <div class="lightbox-nav lightbox-next" id="lightbox-next">&#10095;</div>
      <div class="lightbox-index" id="lightbox-index">1 / 10</div>
  </div>

  <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js" type="text/javascript"></script>
  <script src="js/webflow.js" type="text/javascript"></script>
  <script src="js/other-works.js" type="text/javascript"></script>
</body>
</html>'''

with open('other-works.html', 'w', encoding='utf-8') as f:
    f.write(html_template)
print("other-works.html built successfully.")
