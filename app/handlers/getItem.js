const { getItem } = require("../services/itemService");


exports.handler = async (event) => {
  try {
    const id = event.pathParameters?.id;


    if (!id){
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing item id" }),
    };
  }
// catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         error: "Internal Server Error",
//       }),
//     };
//   }
// };
    const item = await getItem(id);

    if (!item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } 
  catch (error) {
    console.error("getItem error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get item" }),
    };
  }
};