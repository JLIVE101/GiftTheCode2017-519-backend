module.exports = function(sequelize, DataTypes) {
    var Category = sequelize.define('Category', {
        categoryId: {
            type: DataTypes.INTEGER,
            primaryKey: true
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

    return Category;
};