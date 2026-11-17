const resolvers = require("../resolvers");

describe("User.paymentMethods", () => {
  it("returns deterministic full fake cards", () => {
    const a = resolvers.User.paymentMethods({ customer_id: 1 });
    const b = resolvers.User.paymentMethods({ customer_id: 1 });
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
    a.forEach(pm => expect(pm.cardNumber).toMatch(/^4111\d{12}$/));
  });
});
