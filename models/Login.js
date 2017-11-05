module.exports = function(sequelize, DataTypes) {
    var Login = sequelize.define('Login', {
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'login'
    });

    Login.removeAttribute('id');    

    return Login;
};