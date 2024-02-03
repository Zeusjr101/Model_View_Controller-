const router = require('express').Router();
const { User, blog, comment } = require('../models');
const withAuth = require('../utils/auth');

 router.get('/', async (req, res) => {
    try {
     // Get all blogs and JOIN with user data
     const blogData = await blog.findAll({
       include: [
         {
           model: User,
           attributes: ['name'],
         },
       ],
     });

     // Serialize data so the template can read it
     const blogs = blogData.map((blog) => blog.get({ plain: true }));

     // Pass serialized data and session flag into template
     res.render('homepage', { 
       blogs, 
       logged_in: req.session.logged_in 
     });
   } catch (err) {
     res.status(500).json(err);
   }
 });

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login');
});
// GET /signup to render the signup page
router.get('/signup', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('signup');
});
// GET /dashboard to render the dashboard page if user is logged in. If not, redirect to the login page.
router.get('/dashboard', withAuth, async (req, res) => {
  try {
    // Get all blogs and JOIN with user data
    const blogData = await blog.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    // Serialize data so the template can read it
    const blogs = blogData.map((blog) => blog.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('dashboard', { 
      blogs, 
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN =========================================================================  
// POST /login to log in the user
router.post('/login', async (req, res) => {
  try {
    // Find the user who matches the posted e-mail address
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }
    // Verify the posted password with the password store in the database
    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }
    // Create a new session with the user.id
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.json({ user: userData, message: 'You are now logged in!' });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});