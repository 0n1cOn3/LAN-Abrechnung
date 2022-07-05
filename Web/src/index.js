const app = require('./app');

console.log("All Systems Running!")

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: ${process.env.IP}:${port}`);
  /* eslint-enable no-console */
});
