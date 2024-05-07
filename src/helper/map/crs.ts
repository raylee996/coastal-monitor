const CRS_EPSG3395: any = new L.Proj.CRS('EPSG:3395', '+proj=merc +lon_0=0 +k=1 +x_0=140 +y_0=-250 +datum=WGS84 +units=m +no_defs',
    {
        resolutions: function () {
            let level = 19
            let res = [];
            res[0] = Math.pow(2, 18);
            for (let i = 1; i < level; i++) {
                res[i] = Math.pow(2, (18 - i))
            }
            return res;
        }(),
        origin: [0, 0],
        bounds: L.bounds([20037508.342789244, 0], [0, 20037508.342789244])
    });

export {
    CRS_EPSG3395
}