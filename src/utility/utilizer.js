const genRandomPin = (length) => {
  const randomNum = (
    (10 ** length)
      .toString()
      .slice(length - 1)
      + Math.floor(Math.random() * 10 ** length + 1).toString()
  ).slice(-length);
  return Number(randomNum);
};

module.exports = {
  genRandomPin,
};
