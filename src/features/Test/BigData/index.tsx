import { Button, Form } from "antd";
import Input from "antd/es/input/Input";
import Map2D, { MapTileType } from "helper/Map2D"
import { useEffect, useRef, useState } from "react"
import { radarHighIcon } from "helper/mapIcon";

export interface ShipTrackPlayRefProps {
    /** 地图实例 */
    mapLeaflet: Map2D | undefined
}

// 打点图标

let marker: any = null

let myGroup: any;

const BigData: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null)
    const [mapLeaflet, setMapLeaflet] = useState<Map2D>();
    const [latLng, setLatLng] = useState<any>()

    const [form] = Form.useForm();
    // 创建地图实例
    useEffect(() => {
        let _mapLeaflet: Map2D
        if (mapRef.current) {
            let config: any = {
                zoom: 15,
            }
            _mapLeaflet = new Map2D(mapRef.current, MapTileType.satellite, config)
            setMapLeaflet(_mapLeaflet)

            _mapLeaflet.map.on('click', function (ev: any) {
                myGroup && myGroup.clearLayers()
                console.log(ev.latlng, 'ev.latlng')
                if (ev?.latlng) {
                    ev.latlng.lat = ev.latlng.lat?.toFixed(6)
                    ev.latlng.lng = ev.latlng.lng?.toFixed(6)
                }
                ev?.latlng && setLatLng(ev.latlng)
            })
        }
        return () => {
            _mapLeaflet && _mapLeaflet.remove()
        }
    }, [])

    useEffect(() => {
        if (mapLeaflet && latLng?.lat && latLng?.lng) {
          const marker = mapLeaflet.createMarker({
            markerId: 0, latLng: [latLng.lat, latLng.lng]
          }).bindPopup(`<div>经纬度：${latLng.lat},${latLng.lng}</div>`).addTo(mapLeaflet.map);
          marker.openPopup()
          // 将marker放入layer管理
          myGroup = L.layerGroup([marker]);
          mapLeaflet.map.addLayer(myGroup)
        }
      }, [latLng, mapLeaflet])

    async function handleSearch () {
        if (marker && mapLeaflet) {
            mapLeaflet.map.removeLayer(marker)
        }
        let formData = await form.validateFields();
        let icon = radarHighIcon
        const latLng = {
            lat: formData.lat,
            lng: formData.lng
        }
        if (mapLeaflet) {
            marker = L.marker(latLng, { icon }).addTo(mapLeaflet.map);
            mapLeaflet.map.setView(latLng)
        }
    }

    function handleClear(){
        if (marker && mapLeaflet) {
            mapLeaflet.map.removeLayer(marker)
        }
        if(myGroup){
            myGroup && myGroup.clearLayers()
        }
        form.setFieldsValue({
            lat:'',
            lng:''
        })
    }



    return <div>
        <div style={{ position: 'absolute', top: '60px', left: '20px', zIndex: 9999, background: '#071f37', padding: '20px 30px' }}>
            <Form
                form={form}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                autoComplete="off"
                initialValues={{
                    lat: 22.473693,
                    lng: 113.921700
                }}
            >
                <Form.Item label="lat" name='lat' style={{ marginBottom: '8px', width: '200px' }} rules={[{ required: true, message: 'lat不能为空' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="lng" name='lng' style={{ marginBottom: '8px', width: '200px' }}  rules={[{ required: true, message: 'lng不能为空' }]}>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button onClick={handleSearch} type={"primary"}>查看</Button>
                    <Button onClick={handleClear} type={"default"} style={{marginLeft:'10px'}}>清除</Button>
                </Form.Item>
            </Form>
        </div>

        <div ref={mapRef} style={{ width: '100vw', height: '100vh' }}></div>
    </div>
}

export default BigData