// EDS MIGRATION POINT: Replace localStorage below with CDN upload calls

const IMAGES_KEY = 'dx_images';

function getImages() {
    try {
        return JSON.parse(localStorage.getItem(IMAGES_KEY)) || {};
    } catch { return {}; }
}

function saveImages(images) {
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
}

export function storeImage(base64) {
    const id = 'img_' + Date.now();
    const images = getImages();
    images[id] = base64;
    saveImages(images);
    return id; // store this ID in project/user, not the base64
}

export function getImage(id) {
    if (!id) return '';
    if (id.startsWith('http') || id.startsWith('assets/') || id.startsWith('data:image/')) return id; // already a real URL or data URI
    const images = getImages();
    return images[id] || '';
}

export function deleteImage(id) {
    const images = getImages();
    delete images[id];
    saveImages(images);
}