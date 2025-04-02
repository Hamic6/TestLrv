const handleFileValidation = (file) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const validExtensions = ['.jpeg', '.jpg', '.png'];

  // Vérifier le type MIME
  if (!validMimeTypes.includes(file.type)) {
    console.error(`Type MIME invalide : ${file.type}`);
    return false;
  }

  // Vérifier l'extension du fichier
  const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExtensions.includes(fileExtension)) {
    console.error(`Extension de fichier invalide : ${fileExtension}`);
    return false;
  }

  return true;
};

const handlePhotosCaptured = (files) => {
  const validFiles = files.filter(handleFileValidation);

  if (validFiles.length === 0) {
    console.error('Aucun fichier valide capturé.');
    return;
  }

  // Traiter les fichiers valides
  setPhotos(validFiles);
  setPhotosSaved(true);
};