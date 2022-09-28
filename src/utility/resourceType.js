const path = require('path');
const { BadRequestError } = require('../../lib/errors');
const { RESOURCE_TYPE } = require('../config/constants');

const {
  AUDIO, VIDEO, IMAGE, DOCUMENT,
} = RESOURCE_TYPE;

let resourceType;
const imageFormats = ['.jpeg', '.png', '.jpg'];
const audioFormats = ['.mp3', '.mp4', '.mpeg'];
const videoFormats = ['.mp4', '.mov', '.webm', '.wmv', '.mkv', '.flv', '.mpeg'];
const docFormats = ['.doc', '.docx', '.docm', '.pdf', '.txt', '.csv', '.ppt', '.pptx', '.pptm', '.xls', '.xlsm', 'xlsx', '.html'];

// check the file format of the first file
const getResourceType = (file) => {
  if (imageFormats.includes(path.extname(file.originalname))) {
    resourceType = IMAGE;
  } else if (audioFormats.includes(path.extname(file.originalname))) {
    resourceType = AUDIO;
  } else if (videoFormats.includes(path.extname(file.originalname))) {
    resourceType = VIDEO;
  } else if (docFormats.includes(path.extname(file.originalname))) {
    resourceType = DOCUMENT;
  } else throw new BadRequestError('File format not Supported');

  return resourceType;
};

module.exports = getResourceType;
