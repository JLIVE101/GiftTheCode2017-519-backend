module.exports = function(sequelize, DataTypes) {
    var Status = sequelize.define('Status', {
        memberId: {
            type: DataTypes.INTEGER
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        hash: {
            type: DataTypes.UUID,
            default: DataTypes.UUIDV4 
        },
        lastLogin: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
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