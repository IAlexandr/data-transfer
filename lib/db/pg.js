import Sequelize from 'sequelize';

const sequelize = new Sequelize('cameraserver', 'user', 'user21', {
  host: "10.157.212.13",
  dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
  port: 5432,
  logging: false,
});

const CameraType = sequelize.define('cameraType', {
  name: {
    type: Sequelize.STRING,
  },
  rtspUrlTail: {
    type: Sequelize.STRING,
  },
  ImageRtspUrlTail: {
    type: Sequelize.STRING,
  },
});

const CameraModel = sequelize.define('cameraModel', {
  name: {
    type: Sequelize.STRING,
  },
});

const Camera = sequelize.define('camera', {
  geometry: {
    type: Sequelize.JSON,
  },
  ptz: {
    type: Sequelize.BOOLEAN,
  },
  turnedOn: {
    type: Sequelize.BOOLEAN,
  },
  address: {
    type: Sequelize.STRING,
  },
  label: {
    type: Sequelize.STRING,
  },
  connectionOptions: {
    type: Sequelize.JSON
  },
  ping: {
    type: Sequelize.JSON
  },
});

const CameraGroup = sequelize.define('cameraGroup', {
  geometry: {
    type: Sequelize.JSON,
  },
  ptz: {
    type: Sequelize.BOOLEAN,
  },
  turnedOn: {
    type: Sequelize.BOOLEAN,
  },
  address: {
    type: Sequelize.STRING,
  },
  label: {
    type: Sequelize.STRING,
  },
  connectionOptions: {
    type: Sequelize.JSON
  },
  ping: {
    type: Sequelize.JSON
  },
});

sequelize.CameraType = CameraType;
sequelize.CameraModel = CameraModel;
sequelize.Camera = Camera;
CameraType.hasMany(Camera, { as: 'Cameras' });
CameraModel.hasMany(Camera, { as: 'Cameras' });
CameraModel.hasOne(CameraType, { as: 'CameraType' });

export default sequelize;
