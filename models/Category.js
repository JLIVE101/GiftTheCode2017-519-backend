module.exports = function(sequelize, DataTypes) {
    var Category = sequelize.define('Category', {
        categoryId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true            
        },
        categoryName: {
            type: DataTypes.STRING(30),
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'category'
    });

    Category.removeAttribute('id');        

    return Category;
};