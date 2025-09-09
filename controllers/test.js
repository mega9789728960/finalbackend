import bcrypt from "bcrypt"
async function test(){

    const hashedPassword = await bcrypt.hash("Ragavan@2005", 10);
console.log(hashedPassword)

}

test();