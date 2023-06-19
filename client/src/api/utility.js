//  upload image in imgBB

export const imageUpload = async uploadedImage => {
    const formData = new FormData();
    formData.append("image", uploadedImage);

    const img_hosting_token = import.meta.env.VITE_IMGBB_KEY;
    const img_hosting_url = `https://api.imgbb.com/1/upload?key=${img_hosting_token}`;

    const response = await fetch(img_hosting_url, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    return data;
};