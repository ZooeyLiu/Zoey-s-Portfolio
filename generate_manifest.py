import os
import json

base_dir = './images/OtherWorks'
manifest = {
    "series": [],
    "posters": []
}

for root, dirs, files in os.walk(base_dir):
    # Skip hidden files/dirs
    files = [f for f in files if not f.startswith('.')]
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    
    if not files:
        continue
        
    folder_name = os.path.basename(root)
    
    # Square Posters
    if folder_name.lower() == 'posters':
        for f in files:
            path = os.path.join(root, f)
            # Infer some tags
            tags = ["Poster"]
            if "dino" in f.lower(): tags.append("Illustration")
            manifest["posters"].append({
                "path": path.replace('./', ''),
                "tags": tags
            })
    # Series / Packs
    elif folder_name != 'OtherWorks':
        series_item = {
            "title": folder_name.capitalize() if folder_name != 'miss bigo' else 'Miss Bigo Campaign',
            "files": [],
            "tags": ["Campaign System"]
        }
        for f in files:
            path = os.path.join(root, f).replace('./', '')
            # Infer type
            f_lower = f.lower()
            inferred_type = "Graphic"
            if "banner" in f_lower or "bn" in f_lower:
                inferred_type = "Banner"
            elif "op" in f_lower or "opening" in f_lower:
                inferred_type = "Opening Page"
            elif "poster" in f_lower:
                inferred_type = "Poster"
            elif "ig" in f_lower:
                inferred_type = "Social Post"
            elif "host" in f_lower:
                inferred_type = "Host List"
            
            series_item["files"].append({
                "path": path,
                "type": inferred_type
            })
        manifest["series"].append(series_item)

with open('other-works-manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

print("Generated other-works-manifest.json")
