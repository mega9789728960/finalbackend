# TODO List for Fixing 500 Error on Vercel

- [x] Add root route in pg/index.js to handle "/" requests
- [x] Update pg/routers/emailpushrouter.js to use router.post() instead of router.use()
- [x] Update pg/routers/sendcoderouter.js to use router.post() instead of router.use()
- [x] Update pg/routers/emailverifyrouter.js to use router.post() instead of router.use()
- [x] Update pg/routers/approverouter.js to use router.post() instead of router.use()
- [x] Update pg/routers/fetchstudentsrouter.js to use router.post() instead of router.use()
- [ ] Redeploy to Vercel and test the API endpoints
- [ ] Verify that 500 errors are resolved and API returns 200 status codes
