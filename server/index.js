const mongoose = require("mongoose");
const server = require("./app")

const mongoDB = "mongodb://127.0.0.1/andrea";

main().catch((err) => console.log(err));

async function main() {
    await mongoose.connect(mongoDB);
    server.listen(3000, () => {
        console.log("Server listening on http://localhost:3000")
    })
}

main()