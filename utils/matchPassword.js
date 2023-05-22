import bcryptjs from 'bcryptjs';

const match_password = async function (entered_password, user_passwrod) {
    return await bcryptjs.compare(entered_password, user_passwrod)
}

export default match_password