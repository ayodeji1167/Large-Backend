const multer = require('multer');
const path = require('path');
const BadRequestError = require('../../lib/errors/bad-request');

// adjust how files are stored
const storage = multer.diskStorage({});

const fileFilter = function (req, file, callback) {
  // check file format, throw error if file extension does not include the stated format
  const allFileFormat = ['.jpeg', '.png', '.jpg', '.xlsx', '.mp3', '.mp4', '.doc', '.docx', '.pdf', '.txt', '.webm',
    '.wmv',
    '.mpeg',
    '.mkv',
    '.mov',
    '.flv'];

  const fileExtCheck = allFileFormat.includes(path.extname(file.originalname).toLowerCase());

  if (!fileExtCheck && file.originalname !== 'blob') {
    callback(
      new BadRequestError(
        'Upload failed. Supports only .jpeg, .png, .jpg, .xlsx, .doc, .docx, .pdf, .txt,  .webm, .wmv, .mpeg, .mkv, .mov, .flv or blob',
      ),
      false,
    );
    // callback(null, true);
  } else {
    callback(null, true);
  }
};

// const fileSize = () => {
//   const size = 1024 * 1024 * 250;
//   return size;
// };

const upload = multer({
  storage,
  //   limits: {
  //     fileSize: fileSize(),
  //   },
  fileFilter,
});

module.exports = { upload };
