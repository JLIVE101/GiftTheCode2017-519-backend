module.exports = function(sequelize, DataTypes) {
    var Status = sequelize.define('Status', {
        id: {
            type: DataTypes.INTEGER
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        confirmationHash: {
            type: DataTypes.UUID,
            default: DataTypes.UUIDV4
        },
        renewalDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'status'
    });

    // don't need Sequelize-generated id.
    Status.removeAttribute('id');

    return Status;
}