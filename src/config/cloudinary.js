const cloudinary = require('cloudinary');
const { BadRequestError } = require('../../lib/errors');
const constants = require('./constants');

cloudinary.v2.config({
  cloud_name: constants.CLOUDINARY.NAME,
  api_key: constants.CLOUDINARY.API_KEY,
  api_secret: constants.CLOUDINARY.SECRET_KEY,
});

const uploadToCloud = async (filePath, section = 'IMAGE', resourceType = 'auto') => {
  const result = await cloudinary.v2.uploader.upload(filePath, { folder: `BBWE/${section}`, resource_type: `${resourceType}` });
  return result;
};

const deleteFromCloud = async (publicID, resourceType) => {
  await cloudinary.v2.uploader.destroy(publicID, {
    resource_type: `${resourceType}`,
  });
  return 'Delete Successful';
};

const deleteMultiple = async (publicIDs, resourceType) => {
  await cloudinary.v2.api.delete_resources(publicIDs, {
    resource_type: `${resourceType}`,
  });
  return 'All deleted Successfully';
};

const multipleUpload = async (filePaths, section = 'IMAGE', resourceType = 'auto') => {
  // params filename is an array
  const result = await Promise.all(filePaths.map((filePath) => uploadToCloud(
    filePath,
    section,
    resourceType,
  )));
  if (!result) throw new BadRequestError('Multiple file upload failed');
  return result;
};

module.exports = {
  uploadToCloud,
  deleteFromCloud,
  multipleUpload,
  deleteMultiple,
};
