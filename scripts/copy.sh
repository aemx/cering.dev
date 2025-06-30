echo "Generating image files..."

# Make necessary folders
mkdir dist
cp -R src/docs dist/docs

[[ ! -d "dist/img" ]] && mkdir "dist/img"
rsync -av --exclude='*.json' "src/assets/." "dist/assets"