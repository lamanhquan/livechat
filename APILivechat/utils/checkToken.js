import jwt from "jsonwebtoken";

export const tokenPassword = ()=>{
    return "vfvjdfvbjfdbvffgbfubfugbfug"
}

// check can convert to data Obj 
// check expired 
export const checkToken = async (token) => {
    try {
        let user
        try {
            user = await jwt.verify(token, tokenPassword());
            if (user.UnCheckExpired) {
                // console.log('user UnCheckExpired');
                return {
                    userId: user._id,
                    status: true
                }
            }
            if (new Date(user.timeExpried) > new Date()) {
                return {
                    userId: user._id,
                    status: true
                }
            }
            else {
                return {
                    userId: "",
                    status: false
                }
            }
        } catch (err) {
            user = await jwt.verify(token, 'Chamcong365@');
            console.log(user)
            if (user) {
                return {
                    userId: user.data._id,
                    status: true
                }
            }
            else {
                return {
                    userId: "",
                    status: false
                }
            }
        }
    }
    catch (e) {
        console.log(e);
        return {
            userId: "",
            status: false
        }
    }
};