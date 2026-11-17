const { Query } = require("./Query");

// The customer DB has no payment data, so generate deterministic, fake
// 16-digit card numbers (Luhn-valid, 4111 test prefix) derived from the
// customer id (2 cards per customer). Masking/denial is handled elsewhere.
function luhnCheckDigit(digits) {
  let sum = 0;
  for (let i = digits.length - 1, double = true; i >= 0; i--, double = !double) {
    let d = Number(digits[i]);
    if (double) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

function mockPaymentMethods(customerId) {
  const n = Number(customerId) || 0;
  const count = 2;
  return Array.from({ length: count }, (_, i) => {
    const body = "4111" + String((n * 7919 + (i + 1) * 104729) % 100000000000).padStart(11, "0");
    return {
      id: `${customerId}-pm-${i + 1}`,
      cardNumber: body + luhnCheckDigit(body)
    };
  });
}

const resolvers = {
  Query,
  User: {
    __resolveReference: async (reference, { dataSources }) => {
      return dataSources.customerDB.getCustomer(reference.id);
    },
    id: (root) => root.customer_id,
    activeCart: (root) => {
      const cart = {
        owner: root
      }

      if (root.active_cart) {
        cart.items = root.active_cart.split(",").map(id => ({id}))
      }

      return cart;
    },
    paymentMethods: (root) => mockPaymentMethods(root.customer_id),
    firstName: (root) => root.first_name,
    lastName: (root) => root.last_name,
    orders: (root) => {
      if (root.orders) {
        const orders = root.orders.split(",");
        return orders.map(orderId => ({ id: orderId }));
      }
      return [];
    }
  },
  Cart: {
    subtotal: (root) => {
      if (root.items && root.items.length > 0) {
        const orders = root.items;
        return orders.reduce(
          (accumulator, currentItem) => accumulator + currentItem.price,
          0
        );
      }
      return 0;
    }
  }
};

module.exports = resolvers;
