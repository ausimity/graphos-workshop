const { buildSubgraphSchema } = require("@apollo/subgraph");
const { ApolloServer } = require("@apollo/server");
const { readFileSync } = require("fs");
const { parse } = require("graphql");
const resolvers = require("../resolvers");

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs: parse(readFileSync("schema.graphql", { encoding: "utf-8" })),
      resolvers,
    },
  ]),
});

const query = `query ($fullName: String!) {
  userByName(fullName: $fullName) { id firstName lastName email }
}`;

const run = (getCustomerByName, fullName) =>
  server.executeOperation(
    { query, variables: { fullName } },
    { contextValue: { dataSources: { customerDB: { getCustomerByName } } } }
  );

describe("Query.userByName", () => {
  it("returns the matching customer", async () => {
    const getCustomerByName = jest.fn().mockResolvedValue({
      customer_id: "7", first_name: "Jane", last_name: "Doe", email: "jane@example.com",
    });
    const res = await run(getCustomerByName, "Jane Doe");
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data.userByName).toEqual({
      id: "7", firstName: "Jane", lastName: "Doe", email: "jane@example.com",
    });
    expect(getCustomerByName).toHaveBeenCalledWith("Jane Doe");
  });

  it("returns null when nobody matches", async () => {
    const res = await run(jest.fn().mockResolvedValue(null), "Nobody Here");
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data.userByName).toBeNull();
  });
});
