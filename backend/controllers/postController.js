const Post = require('../models/post');

exports.addPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get('host');    /* url of server */
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(result => {          /* to store the data in database */
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        ...result,
        postId: result._id
      }
    });
  })
    .catch((error) => {
      res.status(500).json({ message: 'Creation of post failed, please try again.' });
    });
};

exports.updatePost = (req, res, next) => {

  /* while updating a post, we will have image path for img. we will submit a url if we dont update it otherwise 
  it will be a file. It if is url, get it from req body otherwise construct a new url */

  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get('host');    /* url of server */
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  })
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then((result) => {
    if (result.matchedCount > 0) {
      res.status(200).json({
        message: 'updated successfully!'
      });
    }
    else {
      res.status(401).json({ message: 'User Not Authorized!' });
    }
  }).catch(error => {
    res.status(500).json({ message: 'Editing the post failed, please try again.' });
  });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
    if (result.deletedCount > 0) {
      res.status(200).json({
        message: 'Deletion successfully!'
      });
    }
    else {
      res.status(401).json({ message: 'User Not Authorized!' });
    }
  })
    .catch((error) => {
      res.status(500).json({ message: 'Deletion failed, please try again' });
    });
};

exports.getPosts = (req, res, next) => { 
  // res.send("Response from Express");

  const currentPage = +req.query.page;  /* + is added to convert these into numbers as queryparams extracted from uel are strings */
  const pageSize = +req.query.pagesize;
  const postQuery = Post.find();
  let fetchedPosts;

  if (currentPage && pageSize) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  /* if we send a pageSize and currentPage in our req, the above if block will execute otherwise below code will run */
  postQuery      /* to fetch data from db */
    .then((documents) => {
      fetchedPosts = documents;
      return Post.estimatedDocumentCount();
    }).then((count) => {
      res.status(200).json({
        message: 'posts fetched successfully',
        posts: fetchedPosts,
        maxPost: count
      });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Count not fetch the posts, please try again.' });
    });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post)
    }
    else {
      res.status(404).json({ message: 'Post not found!' })
    }
  }).catch(error => {
    res.status(500).json({ message: 'Count not fetch the post, please try again' });
  });
};


