const { SQLDataSource } = require("datasource-sql");

class CustomerDB extends SQLDataSource {
  constructor({ config, cache, contextValue }) {
    super(config);
    super.initialize({
      context: contextValue,
      cache
    });
  }

  async getCustomers() {
    const customer = await this.knex.select('*').from('customers');
    return customer;
  };

  async getCustomer(id) {
    const customers = await this.knex.select('*').from('customers').where('customer_id', id);
    return customers.length > 0 ? customers[0] : null;
  }

  async getCustomerByName(fullName) {
    const customers = await this.knex
      .select('*')
      .from('customers')
      .whereRaw("CONCAT(first_name, ' ', last_name) = ?", [fullName.trim()])
      .orderBy('customer_id')
      .limit(1);
    return customers.length > 0 ? customers[0] : null;
  }
}

module.exports = CustomerDB;
