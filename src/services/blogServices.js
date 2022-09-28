const { BadRequestError } = require('../../lib/errors');
const { uploadToCloud } = require('../config/cloudinary');

const blogModel = require('../models/blogModel');

class BlogServices {
  createPost = async (req) => {
    const { body, file } = req;

    if (!file) {
      throw new BadRequestError('please provide an image');
    }
    const { url } = await uploadToCloud(file.path);
    const post = blogModel.create(
      {
        ...body,
        userId: req.user._id,
        image: {
          url,
        },
      },
    );
    return post;
  };

  deleteResource = async (req) => {
    const blog = await blogModel.findByIdAndDelete(req);
    return blog;
  };

  edit = async (id, body) => {
    const blog = await blogModel.findByIdAndUpdate(id, body, { new: true });
    return blog;
  };

  getAll = async (req) => {
    const resources = await blogModel.find({ userId: req }).sort({ createdAt: -1 });
    if (!resources) throw new BadRequestError('user has no posts yet');
    return resources;
  };

  getOne = async (req) => {
    const resource = await blogModel.findOne({ _id: req });
    if (!resource) throw new BadRequestError('not foound');
    return resource;
  };
}

module.exports = new BlogServices();
