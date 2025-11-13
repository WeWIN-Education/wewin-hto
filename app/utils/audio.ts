const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    const wavBlob = new Blob([blob], { type: "audio/wav" });
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(wavBlob);
  });
