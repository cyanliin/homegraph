// 自定義中間件檢查必填參數
function validateRequiredParams(requiredParams) {
  return (req, res, next) => {
      let missingParams;
      if (requiredParams.query)
        missingParams = requiredParams.query.filter(param => !req.query[param]);
      if (requiredParams.body)
        missingParams = requiredParams.body.filter(param => !req.body[param]);

      if (missingParams.length > 0) {
        return res.status(400).json({ error: `Missing required parameters: ${missingParams.join(', ')}` });
      }

      next();
  };
}

module.exports = validateRequiredParams