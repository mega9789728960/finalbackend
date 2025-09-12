import bcrypt from "bcrypt"
async function test(){

    const hashedPassword = await bcrypt.hash("1234565", 10);
console.log(hashedPassword)

}

test();