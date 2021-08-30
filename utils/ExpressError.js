class ExpressError extends Error{
    constructors(msg,sts){
        //super();
        this.message=msg;
        this.status=sts;
    }
}
module.exports= ExpressError;