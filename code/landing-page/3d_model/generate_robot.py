"""
Master 3D Procedural Robot Generator for 'ALVI' - ATP Landing Page
Super-accurate 1:1 modeling based on official Front & Rear reference photographs:
- Front (Gemini_Generated_Image_vvrl4nvvrl4nvvrl.jpg):
  * Organic bell-tapered capsule torso with arched shoulders and domed crown
  * Deeply sculpted arched dispenser alcove with smooth fillet rim, warm LED downlight, and stainless drip tray
  * Animated 3D glowing cat-face (^ w ^) on glossy piano-black screen with white bezel
  * Front-left optical sensor eye in chamfered bezel
  * Top-right emergency red switch
  * Right flank 5-slit cooling vents
  * Left flank hydration caddy with translucent blue sports bottle, cap loop, and bracket
  * Anodized aluminum twin T-slot structural columns with black collar brackets
  * Tracked all-terrain crawler base with 3 front sensor portals and rubber treads
- Rear (Gemini_Generated_Image_amll3uamll3uamll.jpg):
  * Large recessed service access door with 6 hex fastener screws
  * Prominent bold navy 'ALVI' corporate branding centered on rear door
  * Upper horizontal cooling vent grille with 3 rows of rounded slots
  * Mechanical release latch to right of grille
  * Matte black rear head casing with crisp white 'ALVI' label
  * Rear chassis sensor ports and maintenance latches
- Animations:
  * 150-frame lifelike loops: Blinking, Winking, Looking Left/Right, Talking/Smiling, Curious Head Tilt, and Idle Torso Breathing
  * Fully exported to WebGL glTF 2.0 binary (.glb) for Google <model-viewer>
"""

import bpy
import bmesh
import math
from mathutils import Vector, Euler
import os

OUTPUT_DIR = "/mnt/Disk0_Vol1/Amodh Gunawardana/ATP/Landing Page/3d_model"
PARENT_DIR = "/mnt/Disk0_Vol1/Amodh Gunawardana/ATP/Landing Page"
RENDERS_DIR = os.path.join(OUTPUT_DIR, "renders")
os.makedirs(RENDERS_DIR, exist_ok=True)

BLEND_PATH = os.path.join(OUTPUT_DIR, "robot_model.blend")
GLB_PATH = os.path.join(OUTPUT_DIR, "robot_model.glb")

FRONT_RENDER_PATH = os.path.join(RENDERS_DIR, "front_reference_match.png")
REAR_RENDER_PATH = os.path.join(RENDERS_DIR, "rear_reference_match.png")
BEAUTY_RENDER_PATH = os.path.join(RENDERS_DIR, "perspective_beauty.png")

# ==============================================================================
# 1. SCENE CLEANUP & SETUP
# ==============================================================================
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 36
    scene.cycles.adaptive_threshold = 0.02
    scene.cycles.use_denoising = True
    
    # 3:2 product photography aspect ratio (1500 x 1000)
    scene.render.resolution_x = 1500
    scene.render.resolution_y = 1000
    scene.render.film_transparent = False

    # Pure high-key commercial studio white background
    scene.world = bpy.data.worlds.new("StudioWorld")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.970, 0.972, 0.975, 1.0)
        bg_node.inputs['Strength'].default_value = 1.0

# ==============================================================================
# 2. PBR SHADER MATERIALS
# ==============================================================================
def create_materials():
    mats = {}

    def get_or_create(name):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()
        return mat, mat.node_tree

    # 1. Body White Ceramic/ABS Polymer (Automotive Clearcoat finish)
    mat, tree = get_or_create('Mat_BodyWhite')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.940, 0.942, 0.948, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.18
    bsdf.inputs['Specular IOR Level'].default_value = 0.55
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = 0.25
        bsdf.inputs['Coat Roughness'].default_value = 0.04
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['BodyWhite'] = mat

    # 2. Alcove Warm Interior
    mat, tree = get_or_create('Mat_AlcoveInterior')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.80, 0.79, 0.78, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.28
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['AlcoveInterior'] = mat

    # 3. Technical Matte Dark Chassis
    mat, tree = get_or_create('Mat_DarkChassis')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.040, 0.040, 0.045, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.55
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['DarkChassis'] = mat

    # 4. Rubber Tread Cleats & Belts
    mat, tree = get_or_create('Mat_TreadRubber')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.028, 0.028, 0.032, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.82
    bsdf.inputs['Specular IOR Level'].default_value = 0.25
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['TreadRubber'] = mat

    # 5. Satin Anodized Aluminum Columns
    mat, tree = get_or_create('Mat_Aluminum')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.86, 0.87, 0.89, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.96
    bsdf.inputs['Roughness'].default_value = 0.22
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['Aluminum'] = mat

    # 6. Polished Brushed Stainless Steel Drip Tray
    mat, tree = get_or_create('Mat_StainlessSteel')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.93, 0.94, 0.95, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.98
    bsdf.inputs['Roughness'].default_value = 0.10
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['StainlessSteel'] = mat

    # 7. Piano Black Glossy Screen Glass
    mat, tree = get_or_create('Mat_ScreenGlass')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.008, 0.008, 0.012, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.03
    bsdf.inputs['Specular IOR Level'].default_value = 0.95
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['ScreenGlass'] = mat

    # 8. Radiant Glowing Emissive Face Shader (^ w ^)
    mat, tree = get_or_create('Mat_EmissiveFace')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.90, 0.98, 1.0, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.05
    bsdf.inputs['Emission Color'].default_value = (0.88, 0.98, 1.0, 1.0)
    bsdf.inputs['Emission Strength'].default_value = 8.5
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['EmissiveFace'] = mat

    # 9. Translucent Blue PET Sports Water Bottle
    mat, tree = get_or_create('Mat_BlueBottle')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.06, 0.58, 0.94, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.04
    bsdf.inputs['IOR'].default_value = 1.48
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = 0.92
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['BlueBottle'] = mat

    # 10. Bottle Cap & Ring Handle
    mat, tree = get_or_create('Mat_BottleCap')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.35, 0.42, 0.48, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.28
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['BottleCap'] = mat

    # 11. Emergency Red Button
    mat, tree = get_or_create('Mat_RedButton')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.92, 0.04, 0.05, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.18
    bsdf.inputs['Specular IOR Level'].default_value = 0.75
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['RedButton'] = mat

    # 12. Optical Glass Sensor Lenses
    mat, tree = get_or_create('Mat_SensorGlass')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.008, 0.008, 0.015, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.02
    bsdf.inputs['Metallic'].default_value = 0.3
    bsdf.inputs['Specular IOR Level'].default_value = 0.95
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['SensorGlass'] = mat

    # 13. Rear Bold 'ALVI' Branding (Deep Navy Slate as in gen_image_1.jpg)
    mat, tree = get_or_create('Mat_RearAlviText')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.018, 0.042, 0.095, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.22
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['RearAlviText'] = mat

    # 14. Crisp White Text (Head Rear 'ALVI' label)
    mat, tree = get_or_create('Mat_TextWhite')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.96, 0.96, 0.97, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.25
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['TextWhite'] = mat

    # 15. Studio Floor Shadow Catcher Material
    mat, tree = get_or_create('Mat_StudioFloor')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.970, 0.972, 0.975, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.90
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    mats['StudioFloor'] = mat

    return mats

# ==============================================================================
# 3. MESH UTILITIES
# ==============================================================================
def apply_smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True

def add_bevel_modifier(obj, width=0.008, segments=3):
    bev = obj.modifiers.new(name='Bevel', type='BEVEL')
    bev.width = width
    bev.segments = segments
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35)
    return bev

def make_rounded_rect_pts(wx, dy, r, n_arc=6):
    """Generates 2D closed polygon vertices for a rectangle with corner radius r."""
    r = min(r, wx - 0.005, dy - 0.005)
    pts = []
    # Q1 (+, +)
    cx, cy = wx - r, dy - r
    for i in range(n_arc + 1):
        a = 0 + (i / n_arc) * (math.pi / 2)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    # Q2 (-, +)
    cx, cy = -(wx - r), dy - r
    for i in range(n_arc + 1):
        a = math.pi / 2 + (i / n_arc) * (math.pi / 2)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    # Q3 (-, -)
    cx, cy = -(wx - r), -(dy - r)
    for i in range(n_arc + 1):
        a = math.pi + (i / n_arc) * (math.pi / 2)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    # Q4 (+, -)
    cx, cy = wx - r, -(dy - r)
    for i in range(n_arc + 1):
        a = 1.5 * math.pi + (i / n_arc) * (math.pi / 2)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    
    clean_pts = []
    for p in pts:
        if not clean_pts or (abs(p[0]-clean_pts[-1][0]) > 1e-5 or abs(p[1]-clean_pts[-1][1]) > 1e-5):
            clean_pts.append(p)
    if clean_pts and abs(clean_pts[0][0]-clean_pts[-1][0]) < 1e-5 and abs(clean_pts[0][1]-clean_pts[-1][1]) < 1e-5:
        clean_pts.pop()
    return clean_pts

# ==============================================================================
# 4. PROCEDURAL MODEL GENERATION
# ==============================================================================

def build_tracked_base(mats):
    """Builds crawler chassis with sprockets, road wheels, rubber tread cleats, and sensor arrays."""
    chassis_objs = []

    # 1. Main Central Chassis Body
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.075))
    chassis = bpy.context.active_object
    chassis.name = "Chassis_Central"
    chassis.scale = (0.33, 0.44, 0.09)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    chassis.data.materials.append(mats['DarkChassis'])
    add_bevel_modifier(chassis, width=0.012, segments=4)
    apply_smooth(chassis)
    chassis_objs.append(chassis)

    # 2. Front 3 Sensor Modules (matching gen_image_2.jpg)
    front_sensors = [
        ("FrontSensor_L", -0.095, -0.222, 0.072, 0.048, 0.026),
        ("FrontSensor_Center", 0.0, -0.222, 0.072, 0.054, 0.028),
        ("FrontSensor_R", 0.095, -0.222, 0.072, 0.048, 0.026)
    ]
    for name, x, y, z, w, h in front_sensors:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z))
        bay = bpy.context.active_object
        bay.name = name
        bay.scale = (w, 0.008, h)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bay.data.materials.append(mats['DarkChassis'])
        add_bevel_modifier(bay, width=0.003, segments=2)
        apply_smooth(bay)
        chassis_objs.append(bay)

        if "Center" in name:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y - 0.001, z))
            glass = bpy.context.active_object
            glass.name = name + "_Glass"
            glass.scale = (w * 0.78, 0.004, h * 0.70)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            glass.data.materials.append(mats['SensorGlass'])
            chassis_objs.append(glass)
        else:
            for eye_dx in [-w * 0.22, w * 0.22]:
                bpy.ops.mesh.primitive_cylinder_add(
                    radius=h * 0.22, depth=0.005, 
                    location=(x + eye_dx, y - 0.001, z), 
                    rotation=(math.radians(90), 0, 0)
                )
                eye = bpy.context.active_object
                eye.name = f"{name}_Lens_{'L' if eye_dx < 0 else 'R'}"
                eye.data.materials.append(mats['SensorGlass'])
                apply_smooth(eye)
                chassis_objs.append(eye)

    # 3. Rear Bumper Details (matching gen_image_1.jpg)
    rear_sensors = [
        ("RearCutout_L", -0.095, 0.222, 0.068, 0.038, 0.022),
        ("RearCenterBay", 0.0, 0.222, 0.072, 0.088, 0.026),
        ("RearCutout_R", 0.095, 0.222, 0.068, 0.038, 0.022),
    ]
    for name, x, y, z, w, h in rear_sensors:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z))
        elem = bpy.context.active_object
        elem.name = name
        elem.scale = (w, 0.006, h)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        elem.data.materials.append(mats['DarkChassis'])
        add_bevel_modifier(elem, width=0.002, segments=2)
        apply_smooth(elem)
        chassis_objs.append(elem)

    # Rear twin cameras in center bay
    for cam_x in [-0.018, 0.018]:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.005, depth=0.005, 
            location=(cam_x, 0.223, 0.072), 
            rotation=(math.radians(90), 0, 0)
        )
        cam = bpy.context.active_object
        cam.name = f"Rear_Camera_{'L' if cam_x < 0 else 'R'}"
        cam.data.materials.append(mats['SensorGlass'])
        apply_smooth(cam)
        chassis_objs.append(cam)

    # 4. Realistic Continuous Crawler Tracks (Left & Right)
    track_offset_x = 0.208
    track_width = 0.078
    w_half = track_width / 2.0
    r = 0.072
    half_l = 0.165

    for side, tx in [('L', -track_offset_x), ('R', track_offset_x)]:
        side_prefix = f"Track_{side}"

        # Track Belt Loop Mesh (Semicircular ends + straight top/bottom)
        belt_mesh = bpy.data.meshes.new(f"{side_prefix}_BeltMesh")
        belt_obj = bpy.data.objects.new(f"{side_prefix}_Belt", belt_mesh)
        bpy.context.collection.objects.link(belt_obj)

        bm = bmesh.new()
        n_arc = 16
        perimeter_pts = []

        # Front semicircle (Y < 0)
        for i in range(n_arc + 1):
            theta = math.pi/2 + (i / n_arc) * math.pi
            y = -half_l + r * math.cos(theta)
            z = 0.075 + r * math.sin(theta)
            perimeter_pts.append((y, z))

        # Rear semicircle (Y > 0)
        for i in range(n_arc + 1):
            theta = -math.pi/2 + (i / n_arc) * math.pi
            y = half_l + r * math.cos(theta)
            z = 0.075 + r * math.sin(theta)
            perimeter_pts.append((y, z))

        verts_left = [bm.verts.new((tx - w_half, y, z)) for y, z in perimeter_pts]
        verts_right = [bm.verts.new((tx + w_half, y, z)) for y, z in perimeter_pts]

        for i in range(len(perimeter_pts)):
            i_next = (i + 1) % len(perimeter_pts)
            bm.faces.new([verts_left[i], verts_right[i], verts_right[i_next], verts_left[i_next]])

        bm.to_mesh(belt_mesh)
        bm.free()

        sol = belt_obj.modifiers.new('Solidify', 'SOLIDIFY')
        sol.thickness = 0.007
        sol.offset = 1.0
        apply_smooth(belt_obj)
        belt_obj.data.materials.append(mats['TreadRubber'])
        chassis_objs.append(belt_obj)

        # 28 Horizontal Rubber Grip Cleats
        total_cleats = 28
        arc_len_semi = math.pi * r
        straight_len = 2 * half_l
        total_perim = 2 * arc_len_semi + 2 * straight_len

        for c_idx in range(total_cleats):
            dist = (c_idx / total_cleats) * total_perim
            if dist < arc_len_semi:
                theta = math.pi/2 + (dist / arc_len_semi) * math.pi
                cy = -half_l + (r + 0.005) * math.cos(theta)
                cz = 0.075 + (r + 0.005) * math.sin(theta)
                rot_x = theta - math.pi/2
            elif dist < arc_len_semi + straight_len:
                d_lin = dist - arc_len_semi
                cy = -half_l + d_lin
                cz = 0.075 - (r + 0.005)
                rot_x = 0
            elif dist < 2 * arc_len_semi + straight_len:
                d_arc = dist - (arc_len_semi + straight_len)
                theta = -math.pi/2 + (d_arc / arc_len_semi) * math.pi
                cy = half_l + (r + 0.005) * math.cos(theta)
                cz = 0.075 + (r + 0.005) * math.sin(theta)
                rot_x = theta - math.pi/2
            else:
                d_lin = dist - (2 * arc_len_semi + straight_len)
                cy = half_l - d_lin
                cz = 0.075 + (r + 0.005)
                rot_x = math.pi

            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(tx, cy, cz), rotation=(rot_x, 0, 0))
            cleat = bpy.context.active_object
            cleat.name = f"{side_prefix}_Cleat_{c_idx}"
            cleat.scale = (w_half * 1.94, 0.009, 0.006)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            cleat.data.materials.append(mats['TreadRubber'])
            chassis_objs.append(cleat)

        # 4 Road Wheels with Aluminum Bolt Hubs
        wheel_y_positions = [-half_l, -0.055, 0.055, half_l]
        for w_i, wy in enumerate(wheel_y_positions):
            bpy.ops.mesh.primitive_cylinder_add(
                radius=r * 0.88, depth=w_half * 1.82, 
                location=(tx, wy, 0.075), 
                rotation=(0, math.radians(90), 0)
            )
            wheel = bpy.context.active_object
            wheel.name = f"{side_prefix}_Wheel_{w_i}"
            wheel.data.materials.append(mats['DarkChassis'])
            apply_smooth(wheel)
            chassis_objs.append(wheel)

            hub_x = tx + (w_half * 0.94 if tx > 0 else -w_half * 0.94)
            bpy.ops.mesh.primitive_cylinder_add(
                radius=r * 0.35, depth=0.008, 
                location=(hub_x, wy, 0.075), 
                rotation=(0, math.radians(90), 0)
            )
            hub = bpy.context.active_object
            hub.name = f"{side_prefix}_WheelHub_{w_i}"
            hub.data.materials.append(mats['Aluminum'])
            apply_smooth(hub)
            chassis_objs.append(hub)

    return chassis_objs

def build_aluminum_columns(mats):
    """Twin vertical structural aluminum extrusion pillars with authentic T-slot flutes."""
    col_objs = []
    col_xs = [-0.105, 0.105]
    z_bottom = 0.12
    z_top = 0.28
    height = z_top - z_bottom
    center_z = (z_top + z_bottom) / 2

    for cx in col_xs:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, 0, center_z))
        col = bpy.context.active_object
        col.name = f"Extrusion_Column_{'L' if cx < 0 else 'R'}"
        col.scale = (0.046, 0.046, height)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        col.data.materials.append(mats['Aluminum'])
        add_bevel_modifier(col, width=0.002, segments=2)
        apply_smooth(col)
        col_objs.append(col)

        # Front & Rear T-slot grooves
        for slot_y in [-0.023, 0.023]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, slot_y, center_z))
            slot = bpy.context.active_object
            slot.name = f"Extrusion_Slot_{'F' if slot_y < 0 else 'B'}_{'L' if cx < 0 else 'R'}"
            slot.scale = (0.010, 0.004, height * 0.98)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            slot.data.materials.append(mats['DarkChassis'])
            col_objs.append(slot)

        # Mounting collars at base and top
        for b_z in [z_bottom + 0.008, z_top - 0.008]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, 0, b_z))
            bracket = bpy.context.active_object
            bracket.name = f"Column_Bracket_{'B' if b_z < center_z else 'T'}_{'L' if cx < 0 else 'R'}"
            bracket.scale = (0.058, 0.058, 0.016)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            bracket.data.materials.append(mats['DarkChassis'])
            add_bevel_modifier(bracket, width=0.002, segments=2)
            apply_smooth(bracket)
            col_objs.append(bracket)

    return col_objs

def build_torso_and_dispenser(mats):
    """
    Constructs the 1:1 organic bell-curved torso shell:
    - Arched shoulders tapering inward towards the neck
    - Domed crown
    - Deeply sculpted arched dispenser alcove with warm LED downlight and stainless drip tray
    """
    torso_objs = []
    
    # 1. 1:1 Sculpted Lofted Torso Shell Mesh
    torso_mesh = bpy.data.meshes.new("Torso_Shell_Mesh")
    torso = bpy.data.objects.new("Torso_Shell", torso_mesh)
    bpy.context.collection.objects.link(torso)

    bm = bmesh.new()

    # Precise vertical height cross-sections (z, wx, dy, corner_radius)
    # Recreates the exact organic silhouette from gen_image_2.jpg and gen_image_1.jpg
    z_profiles = [
        (0.280, 0.200, 0.160, 0.050),
        (0.300, 0.220, 0.180, 0.065),
        (0.350, 0.230, 0.188, 0.075),
        (0.500, 0.230, 0.188, 0.075),
        (0.680, 0.224, 0.182, 0.075),
        (0.760, 0.210, 0.170, 0.070),
        (0.820, 0.190, 0.155, 0.065),
        (0.860, 0.160, 0.130, 0.055),
        (0.885, 0.120, 0.090, 0.040),
        (0.895, 0.040, 0.030, 0.020)
    ]

    rings = []
    for z, wx, dy, r in z_profiles:
        pts = make_rounded_rect_pts(wx, dy, r, n_arc=6)
        ring = [bm.verts.new((px, py, z)) for px, py in pts]
        rings.append(ring)

    for i in range(len(rings) - 1):
        r1 = rings[i]
        r2 = rings[i+1]
        n = len(r1)
        for j in range(n):
            j_next = (j + 1) % n
            bm.faces.new([r1[j], r2[j], r2[j_next], r1[j_next]])

    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bm.to_mesh(torso_mesh)
    bm.free()

    sub = torso.modifiers.new('Subsurf_Smooth', 'SUBSURF')
    sub.levels = 1
    bpy.context.view_layer.objects.active = torso
    bpy.ops.object.modifier_apply(modifier='Subsurf_Smooth')

    # 2. Arched Alcove Cutter (Front cavity)
    cutter_mesh = bpy.data.meshes.new("Alcove_Cutter_Mesh")
    cutter = bpy.data.objects.new("Alcove_Cutter", cutter_mesh)
    bpy.context.collection.objects.link(cutter)

    bm_cut = bmesh.new()
    cw_half = 0.115
    cz_bot = 0.355
    cz_straight = 0.625
    cr_arch = 0.115
    c_y_front = -0.32
    c_y_back = 0.065

    c_loop = []
    c_loop.append((-cw_half, cz_bot))
    c_loop.append((cw_half, cz_bot))
    c_loop.append((cw_half, cz_straight))
    for i in range(16 + 1):
        theta = (i / 16) * math.pi
        c_loop.append((cr_arch * math.cos(theta), cz_straight + cr_arch * math.sin(theta)))
    c_loop.append((-cw_half, cz_straight))

    c_verts_f = [bm_cut.verts.new((px, c_y_front, pz)) for px, pz in c_loop]
    c_verts_b = [bm_cut.verts.new((px, c_y_back, pz)) for px, pz in c_loop]

    for i in range(len(c_loop)):
        i_next = (i + 1) % len(c_loop)
        bm_cut.faces.new([c_verts_f[i], c_verts_b[i], c_verts_b[i_next], c_verts_f[i_next]])
    bm_cut.faces.new(list(reversed(c_verts_b)))
    bm_cut.faces.new(c_verts_f)

    bm_cut.to_mesh(cutter_mesh)
    bm_cut.free()

    bool_mod = torso.modifiers.new('Alcove_Cut', 'BOOLEAN')
    bool_mod.operation = 'DIFFERENCE'
    bool_mod.object = cutter
    bool_mod.solver = 'EXACT'

    bpy.ops.object.modifier_apply(modifier='Alcove_Cut')
    bpy.data.objects.remove(cutter, do_unlink=True)

    torso.data.materials.append(mats['BodyWhite'])
    apply_smooth(torso)
    torso_objs.append(torso)

    # 3. Inner Alcove Cavity Lining with Beveled Inset Lip
    inner_mesh = bpy.data.meshes.new("Alcove_Inner_Mesh")
    inner = bpy.data.objects.new("Alcove_Inner", inner_mesh)
    bpy.context.collection.objects.link(inner)

    bm_in = bmesh.new()
    in_w_half = 0.114
    in_z_bot = 0.356
    in_z_straight = 0.624
    in_r_arch = 0.114
    in_y_front = -0.185
    in_y_back = 0.064

    in_loop = []
    in_loop.append((-in_w_half, in_z_bot))
    in_loop.append((in_w_half, in_z_bot))
    in_loop.append((in_w_half, in_z_straight))
    for i in range(16 + 1):
        theta = (i / 16) * math.pi
        in_loop.append((in_r_arch * math.cos(theta), in_z_straight + in_r_arch * math.sin(theta)))
    in_loop.append((-in_w_half, in_z_straight))

    in_verts_f = [bm_in.verts.new((px, in_y_front, pz)) for px, pz in in_loop]
    in_verts_b = [bm_in.verts.new((px, in_y_back, pz)) for px, pz in in_loop]

    for i in range(len(in_loop)):
        i_next = (i + 1) % len(in_loop)
        bm_in.faces.new([in_verts_f[i], in_verts_b[i], in_verts_b[i_next], in_verts_f[i_next]])
    bm_in.faces.new(list(reversed(in_verts_b)))

    bm_in.to_mesh(inner_mesh)
    bm_in.free()

    inner.data.materials.append(mats['AlcoveInterior'])
    apply_smooth(inner)
    torso_objs.append(inner)

    # Left inner wall recessed vertical slot
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.112, -0.04, 0.52))
    slot_cav = bpy.context.active_object
    slot_cav.name = "Alcove_Inner_Slot"
    slot_cav.scale = (0.004, 0.016, 0.14)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    slot_cav.data.materials.append(mats['DarkChassis'])
    torso_objs.append(slot_cav)

    # 4. Dispenser Nozzle Block & Recessed Warm LED Fixture
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.04, 0.718))
    disp_block = bpy.context.active_object
    disp_block.name = "Dispenser_Nozzle_Block"
    disp_block.scale = (0.075, 0.08, 0.024)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    disp_block.data.materials.append(mats['BodyWhite'])
    add_bevel_modifier(disp_block, width=0.003, segments=2)
    apply_smooth(disp_block)
    torso_objs.append(disp_block)

    # LED Bezel
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.003, location=(0, -0.04, 0.705))
    led_bezel = bpy.context.active_object
    led_bezel.name = "Dispenser_LED_Bezel"
    led_bezel.data.materials.append(mats['StainlessSteel'])
    apply_smooth(led_bezel)
    torso_objs.append(led_bezel)

    # Glowing LED Lens
    bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.004, location=(0, -0.04, 0.704))
    led_lens = bpy.context.active_object
    led_lens.name = "Dispenser_LED_Lens"
    mat_led = bpy.data.materials.new("Mat_DispenserLED")
    mat_led.use_nodes = True
    mat_led.node_tree.nodes.clear()
    em = mat_led.node_tree.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (1.0, 0.94, 0.82, 1.0)
    em.inputs['Strength'].default_value = 18.0
    out_led = mat_led.node_tree.nodes.new('ShaderNodeOutputMaterial')
    mat_led.node_tree.links.new(em.outputs['Emission'], out_led.inputs['Surface'])
    led_lens.data.materials.append(mat_led)
    apply_smooth(led_lens)
    torso_objs.append(led_lens)

    # Downward Warm Spot Light
    bpy.ops.object.light_add(type='SPOT', location=(0, -0.04, 0.702))
    spot = bpy.context.active_object
    spot.name = "Alcove_Downlight"
    spot.data.energy = 9.5
    spot.data.color = (1.0, 0.90, 0.78)
    spot.data.spot_size = math.radians(68)
    spot.data.spot_blend = 0.35
    spot.rotation_euler = (math.radians(180), 0, 0)
    torso_objs.append(spot)

    # 5. Stainless Steel Removable Catch Tray with Rolled Beveled Lip
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.05, 0.375))
    tray = bpy.context.active_object
    tray.name = "Stainless_Steel_Tray"
    tray.scale = (0.185, 0.155, 0.022)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    tray.data.materials.append(mats['StainlessSteel'])
    add_bevel_modifier(tray, width=0.012, segments=4)
    apply_smooth(tray)
    torso_objs.append(tray)

    return torso_objs

def build_details_and_accessories(mats):
    """Front optical sensor eye, red emergency switch, flank vents, and water bottle caddy."""
    acc_objs = []

    # 1. Front Left Wide-Angle Optical Sensor (matching gen_image_2.jpg)
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.022, depth=0.008, 
        location=(-0.118, -0.182, 0.77), 
        rotation=(math.radians(90), 0, 0)
    )
    sensor_rim = bpy.context.active_object
    sensor_rim.name = "Chest_Sensor_Bezel"
    sensor_rim.data.materials.append(mats['DarkChassis'])
    apply_smooth(sensor_rim)
    acc_objs.append(sensor_rim)

    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.016, 
        location=(-0.118, -0.184, 0.77)
    )
    sensor_lens = bpy.context.active_object
    sensor_lens.name = "Chest_Sensor_Lens"
    sensor_lens.scale = (1.0, 0.25, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    sensor_lens.data.materials.append(mats['SensorGlass'])
    apply_smooth(sensor_lens)
    acc_objs.append(sensor_lens)

    # 2. Top-Right Red Emergency Stop Button
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.016, depth=0.010, 
        location=(0.148, -0.102, 0.862), 
        rotation=(math.radians(-25), math.radians(25), 0)
    )
    btn_collar = bpy.context.active_object
    btn_collar.name = "Emergency_Button_Collar"
    btn_collar.data.materials.append(mats['DarkChassis'])
    apply_smooth(btn_collar)
    acc_objs.append(btn_collar)

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.014, depth=0.012, 
        location=(0.151, -0.105, 0.868), 
        rotation=(math.radians(-25), math.radians(25), 0)
    )
    btn = bpy.context.active_object
    btn.name = "Emergency_Button_Cap"
    btn.data.materials.append(mats['RedButton'])
    add_bevel_modifier(btn, width=0.003, segments=3)
    apply_smooth(btn)
    acc_objs.append(btn)

    # 3. Upper Right Flank Speaker Vents
    for slot_i in range(5):
        s_z = 0.745 + slot_i * 0.014
        s_y = -0.01 + slot_i * 0.008
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.208, s_y, s_z), rotation=(0, 0, math.radians(35)))
        vent = bpy.context.active_object
        vent.name = f"Vent_Slot_{slot_i}"
        vent.scale = (0.004, 0.024, 0.004)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        vent.data.materials.append(mats['DarkChassis'])
        acc_objs.append(vent)

    # 4. Side Water Bottle & Caddy (Robot's left flank: X = +0.252m)
    bottle_x = 0.252
    bottle_y = -0.015

    # White holster mount bracket
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.218, bottle_y, 0.44))
    arm = bpy.context.active_object
    arm.name = "Bottle_Caddy_Mount"
    arm.scale = (0.045, 0.035, 0.09)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    arm.data.materials.append(mats['BodyWhite'])
    add_bevel_modifier(arm, width=0.004, segments=2)
    apply_smooth(arm)
    acc_objs.append(arm)

    # White holster sleeve
    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.08, location=(bottle_x, bottle_y, 0.43))
    holster = bpy.context.active_object
    holster.name = "Bottle_Caddy_Holster"
    holster.data.materials.append(mats['BodyWhite'])
    add_bevel_modifier(holster, width=0.004, segments=3)
    apply_smooth(holster)
    acc_objs.append(holster)

    # Dark bottom foot
    bpy.ops.mesh.primitive_cylinder_add(radius=0.046, depth=0.022, location=(bottle_x, bottle_y, 0.38))
    foot = bpy.context.active_object
    foot.name = "Bottle_Caddy_Base"
    foot.data.materials.append(mats['DarkChassis'])
    apply_smooth(foot)
    acc_objs.append(foot)

    # Translucent Blue Sports Bottle Body
    bpy.ops.mesh.primitive_cylinder_add(radius=0.040, depth=0.15, location=(bottle_x, bottle_y, 0.485))
    bottle = bpy.context.active_object
    bottle.name = "Water_Bottle_Body"
    bottle.data.materials.append(mats['BlueBottle'])
    add_bevel_modifier(bottle, width=0.008, segments=3)
    apply_smooth(bottle)
    acc_objs.append(bottle)

    # Sports Cap & Loop Handle
    bpy.ops.mesh.primitive_cylinder_add(radius=0.032, depth=0.032, location=(bottle_x, bottle_y, 0.575))
    cap = bpy.context.active_object
    cap.name = "Water_Bottle_Cap"
    cap.data.materials.append(mats['BottleCap'])
    add_bevel_modifier(cap, width=0.004, segments=2)
    apply_smooth(cap)
    acc_objs.append(cap)

    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.016, minor_radius=0.005, 
        location=(bottle_x, bottle_y - 0.008, 0.598), 
        rotation=(math.radians(90), 0, 0)
    )
    handle = bpy.context.active_object
    handle.name = "Water_Bottle_Handle"
    handle.data.materials.append(mats['BottleCap'])
    apply_smooth(handle)
    acc_objs.append(handle)

    return acc_objs

# ==============================================================================
# 5. REAR SERVICE PANEL & BOLD 'ALVI' BRANDING (Matching gen_image_1.jpg)
# ==============================================================================

def build_rear_service_panel(mats):
    """
    Constructs the 1:1 rear service access door, bold navy ALVI logo,
    upper cooling vent grille, and corner fasteners exactly as shown in gen_image_1.jpg.
    """
    rear_objs = []
    rear_y = 0.188  # Rear surface of torso

    # 1. Main Service Access Door (Beveled inset plate)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, rear_y + 0.001, 0.53))
    panel = bpy.context.active_object
    panel.name = "Rear_Service_Door"
    panel.scale = (0.28, 0.004, 0.33)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    panel.data.materials.append(mats['BodyWhite'])
    add_bevel_modifier(panel, width=0.012, segments=4)
    apply_smooth(panel)
    rear_objs.append(panel)

    # 2. Bold Navy 'ALVI' Lettering on Rear Panel (matching gen_image_1.jpg)
    bpy.ops.object.text_add(location=(0.0, rear_y + 0.004, 0.525), rotation=(math.radians(90), 0, math.radians(180)))
    txt_rear = bpy.context.active_object
    txt_rear.name = "Rear_ALVI_Logo"
    txt_rear.data.body = "ALVI"
    txt_rear.data.size = 0.052  # Bold prominent size
    txt_rear.data.extrude = 0.002
    txt_rear.data.bevel_depth = 0.0005
    txt_rear.data.align_x = 'CENTER'
    txt_rear.data.align_y = 'CENTER'
    txt_rear.data.space_character = 1.15
    bpy.ops.object.convert(target='MESH')
    txt_rear.data.materials.append(mats['RearAlviText'])
    apply_smooth(txt_rear)
    rear_objs.append(txt_rear)

    # 3. 6 Fastener Screws on the Panel (4 corners + 2 middle edges)
    screw_dx = 0.125
    screw_dz = 0.145
    screw_positions = [
        (-screw_dx, 0.53 - screw_dz),
        (screw_dx, 0.53 - screw_dz),
        (-screw_dx, 0.53),
        (screw_dx, 0.53),
        (-screw_dx, 0.53 + screw_dz),
        (screw_dx, 0.53 + screw_dz),
    ]
    for i, (sx, sz) in enumerate(screw_positions):
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.0035, depth=0.004, 
            location=(sx, rear_y + 0.0035, sz), 
            rotation=(math.radians(90), 0, 0)
        )
        screw = bpy.context.active_object
        screw.name = f"Rear_Panel_Screw_{i}"
        screw.data.materials.append(mats['DarkChassis'])
        apply_smooth(screw)
        rear_objs.append(screw)

    # Finger notch on the right edge of the door
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.140, rear_y + 0.002, 0.53))
    notch = bpy.context.active_object
    notch.name = "Rear_Door_FingerNotch"
    notch.scale = (0.006, 0.003, 0.024)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    notch.data.materials.append(mats['DarkChassis'])
    rear_objs.append(notch)

    # 4. Upper Horizontal Cooling Vent Grille (above service door: Z ~ 0.74m)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, rear_y + 0.001, 0.74))
    grille_frame = bpy.context.active_object
    grille_frame.name = "Rear_Cooling_Grille_Frame"
    grille_frame.scale = (0.10, 0.003, 0.038)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    grille_frame.data.materials.append(mats['BodyWhite'])
    add_bevel_modifier(grille_frame, width=0.003, segments=2)
    apply_smooth(grille_frame)
    rear_objs.append(grille_frame)

    # 3 Rows of rounded horizontal cooling slots
    for row in range(3):
        slot_z = 0.730 + row * 0.010
        for col_sign in [-0.030, 0.0, 0.030]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(col_sign, rear_y + 0.003, slot_z))
            slot = bpy.context.active_object
            slot.name = f"Rear_Vent_{row}_{col_sign}"
            slot.scale = (0.024, 0.003, 0.003)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            slot.data.materials.append(mats['DarkChassis'])
            rear_objs.append(slot)

    # 5. Right of Grille Mechanical Release Latch
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.075, rear_y + 0.001, 0.74))
    latch = bpy.context.active_object
    latch.name = "Rear_Release_Latch"
    latch.scale = (0.026, 0.004, 0.024)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    latch.data.materials.append(mats['DarkChassis'])
    add_bevel_modifier(latch, width=0.002, segments=2)
    apply_smooth(latch)
    rear_objs.append(latch)

    return rear_objs

# ==============================================================================
# 6. ANIMATED 3D HEAD & EMISSIVE EXPRESSIONS (^ w ^)
# ==============================================================================

def create_arch_ribbon(name, radius_x, radius_y, thickness, num_pts=16):
    """Creates a smooth curved ribbon representing happy smiling eyes (^ ^)."""
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    in_pts = []
    out_pts = []

    for i in range(num_pts + 1):
        theta = (i / num_pts) * math.pi
        cx = radius_x * math.cos(theta)
        cz = radius_y * math.sin(theta)
        nx = math.cos(theta)
        nz = math.sin(theta)
        in_pts.append(bm.verts.new((cx - nx * thickness * 0.45, 0, cz - nz * thickness * 0.45)))
        out_pts.append(bm.verts.new((cx + nx * thickness * 0.45, 0, cz + nz * thickness * 0.45)))

    for i in range(num_pts):
        bm.faces.new([in_pts[i], out_pts[i], out_pts[i+1], in_pts[i+1]])

    bm.to_mesh(mesh)
    bm.free()
    apply_smooth(obj)
    return obj

def create_cat_mouth_ribbon(name, lobe_rx, lobe_ry, thickness, num_pts=12):
    """Creates a cute cat-mouth ribbon (w / 3 rotated)."""
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    for lobe_sign in [-1.0, 1.0]:
        center_x = lobe_sign * lobe_rx
        in_pts = []
        out_pts = []
        for i in range(num_pts + 1):
            theta = -math.pi + (i / num_pts) * math.pi
            cx = center_x + lobe_rx * math.cos(theta)
            cz = lobe_ry * math.sin(theta)
            nx = math.cos(theta)
            nz = math.sin(theta)
            in_pts.append(bm.verts.new((cx - nx * thickness * 0.45, 0, cz - nz * thickness * 0.45)))
            out_pts.append(bm.verts.new((cx + nx * thickness * 0.45, 0, cz + nz * thickness * 0.45)))

        for i in range(num_pts):
            bm.faces.new([in_pts[i], out_pts[i], out_pts[i+1], in_pts[i+1]])

    bm.to_mesh(mesh)
    bm.free()
    apply_smooth(obj)
    return obj

def build_animated_head_and_face(mats):
    """
    Constructs the head unit:
    - Front: Piano black OLED display with white border and 3D glowing animated face (^ w ^)
    - Rear: Matte black rear enclosure with white 'ALVI' label (matching gen_image_1.jpg)
    """
    head_objs = []
    animated_objs = {}

    head_z = 0.995

    # 1. Twin Black Neck Posts
    for nx in [-0.038, 0.038]:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.012, depth=0.045, 
            location=(nx, 0, 0.905)
        )
        post = bpy.context.active_object
        post.name = f"Neck_Post_{'L' if nx < 0 else 'R'}"
        post.data.materials.append(mats['DarkChassis'])
        apply_smooth(post)
        head_objs.append(post)

    # 2. Head Unit Enclosure (White Outer Bezel Rim)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, head_z))
    head_casing = bpy.context.active_object
    head_casing.name = "Head_Casing"
    head_casing.scale = (0.32, 0.060, 0.14)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    head_casing.data.materials.append(mats['BodyWhite'])
    add_bevel_modifier(head_casing, width=0.024, segments=6)
    apply_smooth(head_casing)
    head_objs.append(head_casing)

    # 3. Rear Matte Black Housing Cover (matching gen_image_1.jpg)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.016, head_z))
    rear_head = bpy.context.active_object
    rear_head.name = "Head_Rear_Cover"
    rear_head.scale = (0.30, 0.030, 0.126)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    rear_head.data.materials.append(mats['DarkChassis'])
    add_bevel_modifier(rear_head, width=0.018, segments=4)
    apply_smooth(rear_head)
    head_objs.append(rear_head)

    # White 'ALVI' text on rear of head unit (matching gen_image_1.jpg)
    bpy.ops.object.text_add(location=(0.0, 0.032, head_z - 0.035), rotation=(math.radians(90), 0, math.radians(180)))
    txt_head_rear = bpy.context.active_object
    txt_head_rear.name = "Head_Rear_ALVI_Text"
    txt_head_rear.data.body = "ALVI"
    txt_head_rear.data.size = 0.014
    txt_head_rear.data.extrude = 0.001
    txt_head_rear.data.align_x = 'CENTER'
    txt_head_rear.data.align_y = 'CENTER'
    txt_head_rear.data.space_character = 1.3
    bpy.ops.object.convert(target='MESH')
    txt_head_rear.data.materials.append(mats['TextWhite'])
    apply_smooth(txt_head_rear)
    head_objs.append(txt_head_rear)

    # 4. Front Piano Black Glossy Screen Faceplate
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.0305, head_z))
    screen_plate = bpy.context.active_object
    screen_plate.name = "Head_Screen_Glass"
    screen_plate.scale = (0.296, 0.002, 0.118)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    screen_plate.data.materials.append(mats['ScreenGlass'])
    add_bevel_modifier(screen_plate, width=0.014, segments=4)
    apply_smooth(screen_plate)
    head_objs.append(screen_plate)

    # 5. 3D Glowing Animated Eyes & Mouth (Hovering in front of screen glass: Y = -0.0320m)
    face_y = -0.0320

    eye_l = create_arch_ribbon("Face_Eye_Left", radius_x=0.025, radius_y=0.018, thickness=0.0055)
    eye_l.location = (-0.052, face_y, head_z + 0.010)
    eye_l.data.materials.append(mats['EmissiveFace'])
    head_objs.append(eye_l)
    animated_objs['eye_l'] = eye_l

    eye_r = create_arch_ribbon("Face_Eye_Right", radius_x=0.025, radius_y=0.018, thickness=0.0055)
    eye_r.location = (0.052, face_y, head_z + 0.010)
    eye_r.data.materials.append(mats['EmissiveFace'])
    head_objs.append(eye_r)
    animated_objs['eye_r'] = eye_r

    mouth = create_cat_mouth_ribbon("Face_Mouth", lobe_rx=0.013, lobe_ry=0.011, thickness=0.0048)
    mouth.location = (0.0, face_y, head_z - 0.022)
    mouth.data.materials.append(mats['EmissiveFace'])
    head_objs.append(mouth)
    animated_objs['mouth'] = mouth

    animated_objs['head'] = head_casing
    animated_objs['rear_head'] = rear_head
    animated_objs['rear_text'] = txt_head_rear
    animated_objs['screen'] = screen_plate

    return head_objs, animated_objs

# ==============================================================================
# 7. ANIMATION CHOREOGRAPHY (Looping 150 Frames)
# ==============================================================================

def animate_robot_expression(animated_objs, torso_obj):
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 150

    eye_l = animated_objs['eye_l']
    eye_r = animated_objs['eye_r']
    mouth = animated_objs['mouth']
    head = animated_objs['head']
    rear_head = animated_objs['rear_head']
    rear_text = animated_objs['rear_text']
    screen = animated_objs['screen']

    base_el_x, base_el_y, base_el_z = eye_l.location.x, eye_l.location.y, eye_l.location.z
    base_er_x, base_er_y, base_er_z = eye_r.location.x, eye_r.location.y, eye_r.location.z
    base_m_x, base_m_y, base_m_z = mouth.location.x, mouth.location.y, mouth.location.z
    base_t_z = torso_obj.location.z

    timeline = [
        # Frame, EyeDX, EyeScaleZ, RightWinkZ, MouthScale(X,Z), MouthDX, HeadTiltRot, TorsoBreathZ
        (1,   0.0,    1.0,  1.0, (1.0, 1.0), 0.0, 0.0, 0.0),
        (25,  0.014,  1.0,  1.0, (1.08, 1.05), 0.004, math.radians(2.2), 0.002),
        (45,  0.0,    1.0,  1.0, (1.20, 1.25), 0.0, 0.0, 0.0),
        (60,  0.0,    1.0,  1.0, (1.0, 1.0), 0.0, 0.0, -0.001),
        (70,  0.0,    1.0,  1.0, (1.0, 1.0), 0.0, 0.0, 0.0),
        (73,  0.0,    0.06, 0.06, (0.95, 0.8), 0.0, 0.0, 0.0),      # Double blink 1
        (76,  0.0,    1.0,  1.0, (1.05, 1.0), 0.0, 0.0, 0.0),
        (80,  0.0,    0.06, 0.06, (0.95, 0.8), 0.0, 0.0, 0.0),      # Double blink 2
        (83,  0.0,    1.08, 1.08, (1.1, 1.05), 0.0, 0.0, 0.001),
        (98,  -0.014, 1.0,  1.0, (1.08, 1.05), -0.004, math.radians(-2.2), 0.002), # Curious look
        (112, -0.005, 1.0,  0.06, (1.15, 1.1), 0.006, math.radians(1.5), 0.0),     # Playful wink
        (124, 0.0,    1.0,  1.0, (1.05, 1.0), 0.0, 0.0, 0.0),
        (140, 0.0,    1.0,  1.0, (1.0, 1.0), 0.0, 0.0, -0.001),
        (150, 0.0,    1.0,  1.0, (1.0, 1.0), 0.0, 0.0, 0.0),
    ]

    for f, dx, es_z, r_wink, ms, m_dx, h_tilt, t_dz in timeline:
        eye_l.location = (base_el_x + dx, base_el_y, base_el_z)
        eye_l.scale = (1.0, 1.0, es_z)
        eye_l.keyframe_insert(data_path='location', frame=f)
        eye_l.keyframe_insert(data_path='scale', frame=f)

        eye_r.location = (base_er_x + dx, base_er_y, base_er_z)
        eye_r.scale = (1.0, 1.0, r_wink if r_wink < 1.0 else es_z)
        eye_r.keyframe_insert(data_path='location', frame=f)
        eye_r.keyframe_insert(data_path='scale', frame=f)

        mouth.location = (base_m_x + m_dx, base_m_y, base_m_z)
        mouth.scale = (ms[0], 1.0, ms[1])
        mouth.rotation_euler = (0, 0, math.radians(h_tilt * 2.0))
        mouth.keyframe_insert(data_path='location', frame=f)
        mouth.keyframe_insert(data_path='scale', frame=f)
        mouth.keyframe_insert(data_path='rotation_euler', frame=f)

        for h_part in [head, rear_head, rear_text, screen]:
            h_part.rotation_euler = (0, 0, h_tilt)
            h_part.keyframe_insert(data_path='rotation_euler', frame=f)

        torso_obj.location.z = base_t_z + t_dz
        torso_obj.keyframe_insert(data_path='location', frame=f)

    for obj in [eye_l, eye_r, mouth, head, rear_head, rear_text, screen, torso_obj]:
        if obj.animation_data and obj.animation_data.action:
            for fcurve in obj.animation_data.action.fcurves:
                for kf in fcurve.keyframe_points:
                    kf.interpolation = 'BEZIER'
                    kf.easing = 'EASE_IN_OUT'

# ==============================================================================
# 8. STUDIO ENVIRONMENT & CAMERAS
# ==============================================================================

def build_studio_environment(mats):
    env_objs = []

    bpy.ops.mesh.primitive_plane_add(size=30.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Studio_Floor_ShadowCatcher"
    floor.data.materials.append(mats['StudioFloor'])
    floor.is_shadow_catcher = True
    env_objs.append(floor)

    # 4-Point High-Key Softbox Studio Lighting Setup
    bpy.ops.object.light_add(type='AREA', location=(1.8, -3.0, 2.0))
    key = bpy.context.active_object
    key.name = "Light_Key_Area"
    key.data.energy = 55.0
    key.data.size = 2.0
    key.data.color = (1.0, 0.98, 0.96)
    key.rotation_euler = (math.radians(50), math.radians(10), math.radians(-30))
    env_objs.append(key)

    bpy.ops.object.light_add(type='AREA', location=(-1.8, -2.8, 1.6))
    fill = bpy.context.active_object
    fill.name = "Light_Fill_Area"
    fill.data.energy = 32.0
    fill.data.size = 2.2
    fill.data.color = (0.97, 0.98, 1.0)
    fill.rotation_euler = (math.radians(50), math.radians(-10), math.radians(30))
    env_objs.append(fill)

    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.0, 2.6))
    top = bpy.context.active_object
    top.name = "Light_Top_Softbox"
    top.data.energy = 38.0
    top.data.size = 2.5
    top.data.color = (1.0, 1.0, 1.0)
    env_objs.append(top)

    bpy.ops.object.light_add(type='AREA', location=(0.0, 3.2, 1.8))
    rear_light = bpy.context.active_object
    rear_light.name = "Light_Rear_Area"
    rear_light.data.energy = 48.0
    rear_light.data.size = 2.2
    rear_light.rotation_euler = (math.radians(-50), 0, math.radians(180))
    env_objs.append(rear_light)

    return env_objs

def setup_cameras():
    cameras = {}

    # Front Camera (matching gen_image_2.jpg / Gemini_Generated_Image_vvrl4nvvrl4nvvrl.jpg)
    cam_front_data = bpy.data.cameras.new("Cam_Front_Data")
    cam_front_data.lens = 72.0
    cam_front = bpy.data.objects.new("Camera_Front", cam_front_data)
    bpy.context.collection.objects.link(cam_front)
    cam_front.location = (0.0, -3.35, 0.535)
    cam_front.rotation_euler = (math.radians(90.0), 0, 0)
    cameras['front'] = cam_front

    # Rear Camera (matching gen_image_1.jpg / Gemini_Generated_Image_amll3uamll3uamll.jpg)
    cam_rear_data = bpy.data.cameras.new("Cam_Rear_Data")
    cam_rear_data.lens = 72.0
    cam_rear = bpy.data.objects.new("Camera_Rear", cam_rear_data)
    bpy.context.collection.objects.link(cam_rear)
    cam_rear.location = (0.0, 3.35, 0.535)
    cam_rear.rotation_euler = (math.radians(90.0), 0, math.radians(180))
    cameras['rear'] = cam_rear

    # Beauty 3/4 Perspective Camera
    cam_beauty_data = bpy.data.cameras.new("Cam_Beauty_Data")
    cam_beauty_data.lens = 55.0
    cam_beauty = bpy.data.objects.new("Camera_Beauty", cam_beauty_data)
    bpy.context.collection.objects.link(cam_beauty)
    cam_beauty.location = (-2.30, -2.90, 1.15)
    cam_beauty.rotation_euler = (math.radians(76), 0, math.radians(-38))
    cameras['beauty'] = cam_beauty

    return cameras

# ==============================================================================
# 9. MAIN PIPELINE
# ==============================================================================
def main():
    print("=" * 60)
    print("STARTING ALVI 1:1 MASTER 3D MODEL GENERATION")
    print("=" * 60)

    reset_scene()

    print("[1/6] Building high-end PBR materials...")
    mats = create_materials()

    print("[2/6] Generating front & rear robot components...")
    chassis_objs = build_tracked_base(mats)
    col_objs = build_aluminum_columns(mats)
    torso_objs = build_torso_and_dispenser(mats)
    acc_objs = build_details_and_accessories(mats)
    rear_objs = build_rear_service_panel(mats)
    head_objs, animated_objs = build_animated_head_and_face(mats)
    env_objs = build_studio_environment(mats)
    cameras = setup_cameras()

    print("[3/6] Applying 150-frame lifelike animations (Eyes, Mouth, Head, Torso)...")
    torso_main = [o for o in torso_objs if o.name == 'Torso_Shell'][0]
    animate_robot_expression(animated_objs, torso_main)

    print(f"Total objects created: {len(bpy.data.objects)}")

    # Save Blender Master File
    print(f"[4/6] Saving Blender scene: {BLEND_PATH}")
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)

    # Export glTF 2.0 Binary with Animations included!
    print(f"[5/6] Exporting web-ready glTF 2.0 binary (.glb) with animation tracks: {GLB_PATH}")
    bpy.ops.object.select_all(action='DESELECT')
    robot_objs = chassis_objs + col_objs + torso_objs + acc_objs + rear_objs + head_objs
    for obj in robot_objs:
        if obj.type == 'MESH':
            obj.select_set(True)
    bpy.context.view_layer.objects.active = [o for o in robot_objs if o.type == 'MESH'][0]

    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format='GLB',
        use_selection=True,
        export_apply=False,
        export_animations=True,
        export_materials='EXPORT',
        export_image_format='AUTO'
    )
    print("GLB export with animation complete!")

    # Synchronize GLB & BLEND to parent directory as well
    import shutil
    shutil.copy2(GLB_PATH, os.path.join(PARENT_DIR, "robot_model.glb"))
    shutil.copy2(BLEND_PATH, os.path.join(PARENT_DIR, "robot_model.blend"))

    # Render Showcase Views at Frame 1
    print("[6/6] Rendering studio views with Cycles...")
    bpy.context.scene.frame_set(1)

    # 1. Front View (Matching gen_image_2.jpg)
    bpy.context.scene.camera = cameras['front']
    bpy.context.scene.render.filepath = FRONT_RENDER_PATH
    print(f"Rendering Front View to: {FRONT_RENDER_PATH}")
    bpy.ops.render.render(write_still=True)

    # 2. Rear View (Matching gen_image_1.jpg)
    bpy.context.scene.camera = cameras['rear']
    bpy.context.scene.render.filepath = REAR_RENDER_PATH
    print(f"Rendering Rear View to: {REAR_RENDER_PATH}")
    bpy.ops.render.render(write_still=True)

    # 3. Beauty 3/4 View
    bpy.context.scene.camera = cameras['beauty']
    bpy.context.scene.render.filepath = BEAUTY_RENDER_PATH
    print(f"Rendering Beauty 3/4 View to: {BEAUTY_RENDER_PATH}")
    bpy.ops.render.render(write_still=True)

    print("=" * 60)
    print("ALVI 1:1 MASTER MODEL SUCCESSFULLY BUILT AND RENDERED!")
    print("=" * 60)

if __name__ == "__main__":
    main()
