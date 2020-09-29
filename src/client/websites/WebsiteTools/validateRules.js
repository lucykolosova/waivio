export default {
  domain: [
    {
      required: true,
      message: 'Field is required',
    },
    {
      pattern: /[a-z,0-9]+$\b/,
      // message:
    },
    {
      validator: (rule, value) =>
        value !== 'www'
          ? Promise.resolve()
          : Promise.reject('You can`t use only www in domain name'),
    },
  ],
  politics: [
    {
      required: true,
      message: 'Field is required',
    },
    {
      validator: (_, value) =>
        value ? Promise.resolve() : Promise.reject('Should accept agreement'),
    },
  ],
};
