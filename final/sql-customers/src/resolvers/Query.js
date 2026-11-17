module.exports = {
  Query: {
    // Returns the product
    users(_, __, { dataSources }) {
      return dataSources.customerDB.getCustomers();
    },
    user(_, { id }, { dataSources }) {
      return dataSources.customerDB.getCustomer(id);
    },
    userByName(_, { fullName }, { dataSources }) {
      return dataSources.customerDB.getCustomerByName(fullName);
    }
  }
};
