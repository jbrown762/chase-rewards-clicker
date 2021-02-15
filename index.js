(async function () {
  await require("./app").handler({}, {}, (error, result) => {
    if (error) {
      console.error(error);
    } else if (result) {
      console.info(result);
    }
  });
}());
