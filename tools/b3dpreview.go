package main

import (
	"fmt"
	"os"
	"math"
	"bytes"
	"io/ioutil"
	"encoding/binary"
	"strings"
	"github.com/davecgh/go-spew/spew"
)

var le = binary.LittleEndian



type Printable interface {
	Print(depth int)
}



type Model struct {
	Version  uint32 // always 0x1
	Textures []*Texture
	Brushes  []*Brush
	Root     *Node
}

func (m *Model) Print() {
	fmt.Printf("BB3D v%d, %d textures, %d brushes\n", m.Version, len(m.Textures), len(m.Brushes))
	for i := 0; i < len(m.Textures); i++ {
		fmt.Printf(" * %s\n", m.Textures[i].Path)
	}
	if m.Root != nil {
		m.Root.Print(0)
	}
}



type Texture struct {
	Path string

	// 0x00001: Has RGB channel
	// 0x00002: Has alpha channel
	// 0x00004: Color Keyed, rgb(0,0,0) become transparent
	// 0x00008: Generate mipmaps
	// 0x00010: Clamp U, TODO: probably GL_CLAMP_TO_BORDER, could be GL_CLAMP_TO_EDGE
	// 0x00020: Clamp V, same
	// 0x00040: Spherical environment map (TODO: is this used?)
	// 0x00080: Cubic environment map     (TODO: is this used?)
	// 0x00100: Store texture in vram     (TODO: probably ignore this)
	// 0x00200: Force the use of high color textures (we should probably ignore this flag)
	// 0x10000: Use secondary UV values
	// https://kippykip.com/b3ddocs/commands/3d_commands/CreateTexture.htm
	Flags uint32

	// 0: Do not blend
	// 1: No blend, or Alpha (alpha when texture loaded with alpha flag - not recommended for multitexturing - see below)
	// 2: Multiply (default)
	// 3: Add
	// 4: Dot3
	// 5: Multiply 2
	// https://kippykip.com/b3ddocs/commands/3d_commands/TextureBlend.htm
	// https://kippykip.com/b3ddocs/commands/3d_commands/EntityBlend.htm
	Blend uint32

	Position [2]float32
	Scale    [2]float32
	Rotation float32    // radians, todo: clockwise or not?
}



type Brush struct {
	Name string

	RGBA     [4]float32
	Specular float32

	// 1: Alpha
	// 2: Multiply
	// 3: Add
	// https://kippykip.com/b3ddocs/commands/3d_commands/BrushBlend.htm
	Blend uint32

	// 0x00: No effects
	// 0x01: Full-bright
	// 0x02: Vertex colors instead of brush color
	// 0x04: Flat shading
	// 0x08: No Fog
	// 0x10: No backface culling
	// https://kippykip.com/b3ddocs/commands/3d_commands/BrushFX.htm
	Effects uint32

	Textures []int
}



type Node struct {
	Name string

	Position [3]float32
	Scale    [3]float32
	Rotation [4]float32 // WXYZ

	Kind      interface{}
	Keys      [][]Key
	Animation *Animation
	Children  []*Node
}

func (n *Node) CountMeshes() int {
	total := 0
	switch n.Kind.(type) {
	case *Mesh:
		total++
	}

	for i := 0; i < len(n.Children); i++ {
		total += n.Children[i].CountMeshes()
	}

	return total
}

func (n *Node) Print(depth int) {
	fmt.Printf("%sNODE %s", strings.Repeat(" ", depth), n.Name)

	if n.Kind == nil {
		fmt.Printf(" PIVOT\n")
	} else {
		fmt.Printf("\n")
		n.Kind.(Printable).Print(depth + 4)
	}

	for i := 0; i < len(n.Children); i++ {
		n.Children[i].Print(depth + 4)
	}
}



type Mesh struct {
	Brush     int
	Vertices  Vertices
	Triangles []*Triangles
}

func (m *Mesh) Print(depth int) {
	fmt.Printf("%sMESH, brush %d\n", strings.Repeat(" ", depth), m.Brush)
	m.Vertices.Print(depth + 4)
	for i := range m.Triangles {
		m.Triangles[i].Print(depth + 4)
	}
}



type Vertices struct {
	Normals  bool
	Color    bool
	Textures int
	DoubleUV bool
	Data     []float32
}

func (v *Vertices) StrideFloats() int {
	stride := 3
	if v.Normals {
		stride += 3
	}
	if v.Color {
		stride += 4
	}
	uvStride := 2
	if v.DoubleUV {
		uvStride *= 2
	}
	return stride + v.Textures * uvStride
}

func (v *Vertices) Print(depth int) {
	stride := v.StrideFloats()
	fmt.Printf("%s%d vertices\n", strings.Repeat(" ", depth), len(v.Data)/stride)

	i := 0
mainLoop:
	for {
		fmt.Printf("%s%d: ", strings.Repeat(" ", depth + 2), i/stride)
		stridesPerLine := 2
		for j := 0; j < stridesPerLine; j++ {
			for k := 0; k < stride; k++ {
				fmt.Printf("%f,", v.Data[i])
				i++
				if i == len(v.Data) {
					fmt.Printf("\n")
					break mainLoop
				}
				if k+1 == stride && j+1 != stridesPerLine {
					fmt.Printf("  ")
				}
			}
		}
		fmt.Printf("\n")
	}
}



type Triangles struct {
	Brush int
	Data  []uint32
}

func (t *Triangles) Print(depth int) {
	stride := 3
	fmt.Printf("%s%d triangles with brush %d\n", strings.Repeat(" ", depth), len(t.Data)/stride, t.Brush)

	i := 0
mainLoop:
	for {
		fmt.Printf("%s%d: ", strings.Repeat(" ", depth + 2), i/stride)
		stridesPerLine := 8
		for j := 0; j < stridesPerLine; j++ {
			for k := 0; k < stride; k++ {
				fmt.Printf("%d,", t.Data[i])
				i++
				if i == len(t.Data) {
					fmt.Printf("\n")
					break mainLoop
				}
				if k+1 == stride && j+1 != stridesPerLine {
					fmt.Printf("  ")
				}
			}
		}
		fmt.Printf("\n")
	}
}



type Bone struct {
	Vertices []uint32
	Weights  []float32
}

func (b *Bone) Print(depth int) {
	fmt.Printf("%sBONE, %d weights\n", strings.Repeat(" ", depth), len(b.Weights))
}



type Key struct {
	Frame    uint32
	Position [3]float32
	Scale    [3]float32
	Rotation [4]float32
}



type Animation struct {
	Frames uint32
	FPS    float32
}



func nextTag(data []byte) (string, []byte, error) {
	if len(data) == 0 {
		return "", nil, nil
	} else if len(data) < 8 {
		return "", nil, fmt.Errorf("Not enough data for tag header: %d/8", len(data))
	}

	tag := string(data[:4])
	size := le.Uint32(data[4:8])
	data = data[8:]

	if uint64(len(data)) < uint64(size) {
		return "", nil, fmt.Errorf("Not enough data for tag content: %d/%d", len(data), size)
	}

	subdata := data[:size]
	return tag, subdata, nil
}

func parseZeroTerminatedString(data []byte) (string, error) {
	i := bytes.IndexByte(data, 0)
	if i == -1 {
		return "", fmt.Errorf("Unable to find null terminator for string")
	}
	return string(data[:i]), nil
}

func ParseModel(data []byte) (*Model, error) {
	tag, subdata, err := nextTag(data)
	if err != nil {
		return nil, err
	}
	if tag != "BB3D" {
		return nil, fmt.Errorf("Expected BB3D tag at the beginning of the file")
	}
	data = data[len(subdata)+8:]

	return ParseBB3DChunk(subdata)
}

func ParseBB3DChunk(data []byte) (*Model, error) {
	if len(data) < 4 {
		return nil, fmt.Errorf("Not enough data for BB3D chunk: %d/4", len(data))
	}

	m := &Model{
		Version:  le.Uint32(data[0:4]),
	}
	data = data[4:]

	if m.Version != 0x01 {
		return nil, fmt.Errorf("Unknown BB3D chunk version: %d", m.Version)
	}

	for {
		tag, subdata, err := nextTag(data)
		if err != nil {
			return nil, err
		}
		if tag == "" {
			break
		}
		data = data[len(subdata)+8:]

		switch tag {
		case "TEXS":
			if m.Textures != nil {
				return nil, fmt.Errorf("Duplicate TEXS chunk inside BB3D")
			}
			m.Textures, err = ParseTEXSChunk(subdata)
		case "BRUS":
			if m.Brushes != nil {
				return nil, fmt.Errorf("Duplicate BRUS chunk inside BB3D")
			}
			m.Brushes, err = ParseBRUSChunk(subdata)
		case "NODE":
			if m.Root != nil {
				return nil, fmt.Errorf("Duplicate NODE chunk inside BB3D")
			}
			m.Root, err = ParseNODEChunk(subdata)
		default:
			// todo: report warning, but only 1 per file
		}

		if err != nil {
			return nil, err
		}
	}

	return m, nil
}

func ParseTEXSChunk(data []byte) ([]*Texture, error) {
	texs := []*Texture{}
	for len(data) != 0 {
		t := &Texture{}

		var err error
		t.Path, err = parseZeroTerminatedString(data)
		if err != nil {
			return nil, err
		}
		data = data[len(t.Path)+1:]

		dataNeeded := 5*4 + 2*4
		if len(data) < dataNeeded {
			return nil, fmt.Errorf("Not enough data for TEXS chunk: %d/%d", len(data), dataNeeded)
		}

		t.Flags = le.Uint32(data[0:4])
		t.Blend = le.Uint32(data[4:8])
		data = data[8:]

		t.Position[0] = math.Float32frombits(le.Uint32(data[0:4]))
		t.Position[1] = math.Float32frombits(le.Uint32(data[4:8]))
		data = data[8:]

		t.Scale[0] = math.Float32frombits(le.Uint32(data[0:4]))
		t.Scale[1] = math.Float32frombits(le.Uint32(data[4:8]))
		data = data[8:]

		t.Rotation = math.Float32frombits(le.Uint32(data[0:4]))
		data = data[4:]

		texs = append(texs, t)
	}
	return texs, nil
}

func ParseBRUSChunk(data []byte) ([]*Brush, error) {
	if len(data) < 4 {
		return nil, fmt.Errorf("Not enough data for BRUS chunk: %d/4", len(data))
	}

	ntexs := int(le.Uint32(data))
	data = data[4:]

	brushes := []*Brush{}
	for len(data) != 0 {
		b := &Brush{
			Textures: make([]int, ntexs, ntexs),
		}

		var err error
		b.Name, err = parseZeroTerminatedString(data)
		if err != nil {
			return nil, err
		}
		data = data[len(b.Name)+1:]

		dataNeeded := 4*4 + 4 + 2*4 + ntexs*4
		if len(data) < dataNeeded {
			return nil, fmt.Errorf("Not enough data for BRUS chunk: %d/%d", len(data), dataNeeded)
		}

		b.RGBA[0] = math.Float32frombits(le.Uint32(data[0:4]))
		b.RGBA[1] = math.Float32frombits(le.Uint32(data[4:8]))
		b.RGBA[2] = math.Float32frombits(le.Uint32(data[8:12]))
		b.RGBA[3] = math.Float32frombits(le.Uint32(data[12:16]))
		data = data[16:]

		b.Specular = math.Float32frombits(le.Uint32(data[0:4]))
		data = data[4:]

		b.Blend = le.Uint32(data[0:4])
		b.Effects = le.Uint32(data[4:8])
		data = data[8:]

		for k := range b.Textures {
			b.Textures[k] = int(int32(le.Uint32(data[0:4])))
			data = data[4:]
		}
		
		brushes = append(brushes, b)
	}
	return brushes, nil
}

func ParseNODEChunk(data []byte) (*Node, error) {
	n := &Node{}

	var err error
	n.Name, err = parseZeroTerminatedString(data)
	if err != nil {
		return nil, err
	}
	data = data[len(n.Name)+1:]

	dataNeeded := 3*4 * 3*4 + 4*4
	if len(data) < dataNeeded {
		return nil, fmt.Errorf("Not enough data for NODE chunk: %d/%d", len(data), dataNeeded)
	}

	n.Position[0] = math.Float32frombits(le.Uint32(data[0:4]))
	n.Position[1] = math.Float32frombits(le.Uint32(data[4:8]))
	n.Position[2] = math.Float32frombits(le.Uint32(data[8:12]))
	data = data[12:]

	n.Scale[0] = math.Float32frombits(le.Uint32(data[0:4]))
	n.Scale[1] = math.Float32frombits(le.Uint32(data[4:8]))
	n.Scale[2] = math.Float32frombits(le.Uint32(data[8:12]))
	data = data[12:]

	n.Rotation[0] = math.Float32frombits(le.Uint32(data[0:4]))
	n.Rotation[1] = math.Float32frombits(le.Uint32(data[4:8]))
	n.Rotation[2] = math.Float32frombits(le.Uint32(data[8:12]))
	n.Rotation[3] = math.Float32frombits(le.Uint32(data[12:16]))
	data = data[16:]

	for {
		tag, subdata, err := nextTag(data)
		if err != nil {
			return nil, err
		}
		if tag == "" {
			break
		}
		data = data[len(subdata)+8:]

		switch tag {
		case "MESH":
			if n.Kind != nil {
				return nil, fmt.Errorf("Duplicate MESH chunk inside NODE")
			}
			n.Kind, err = ParseMESHChunk(subdata)
		case "BONE":
			if n.Kind != nil {
				return nil, fmt.Errorf("Duplicate BONE chunk inside NODE")
			}
			n.Kind, err = ParseBONEChunk(subdata)
		case "KEYS":
			if n.Keys == nil {
				n.Keys = [][]Key{}
			}
			var keys []Key
			keys, err = ParseKEYSChunk(subdata)
			n.Keys = append(n.Keys, keys)
		case "ANIM":
			if n.Animation != nil {
				return nil, fmt.Errorf("Duplicate ANIM chunk inside NODE")
			}
			n.Animation, err = ParseANIMChunk(subdata)
		case "NODE":
			if n.Children == nil {
				n.Children = []*Node{}
			}
			var child *Node
			child, err = ParseNODEChunk(subdata)
			n.Children = append(n.Children, child)
		default:
			// TODO: issue a warning and continue
		}

		if err != nil {
			return nil, err
		}
	}

	return n, nil
}

func ParseMESHChunk(data []byte) (*Mesh, error) {
	dataNeeded := 4 + 8 + 8
	if len(data) < dataNeeded {
		return nil, fmt.Errorf("Not enough data for MESH chunk: %d/%d", len(data), dataNeeded)
	}

	m := &Mesh{
		Brush:     int(int32(le.Uint32(data[0:4]))),
		Triangles: []*Triangles{},
	}
	data = data[4:]

	// must parse vertices
	{
		tag, subdata, err := nextTag(data)
		if err != nil {
			return nil, err
		}
		if tag != "VRTS" {
			return nil, fmt.Errorf("Expected VRTS tag inside MESH")
		}
		data = data[len(subdata)+8:]

		vertices, err := ParseVRTSChunk(subdata)
		if err != nil {
			return nil, err
		}
		m.Vertices = *vertices
	}

	for {
		tag, subdata, err := nextTag(data)
		if err != nil {
			return nil, err
		}
		if tag == "" {
			break
		}
		if tag != "TRIS" {
			return nil, fmt.Errorf("Expected TRIS tag inside MESH")
		}
		data = data[len(subdata)+8:]

		tris, err := ParseTRISChunk(subdata)
		if err != nil {
			return nil, err
		}
		m.Triangles = append(m.Triangles, tris)
	}

	if len(m.Triangles) < 1 {
		return nil, fmt.Errorf("Expected at least one set of triangles inside MESH")
	}

	return m, nil
}

func ParseVRTSChunk(data []byte) (*Vertices, error) {
	dataNeeded := 4 + 4 + 4
	if len(data) < dataNeeded {
		return nil, fmt.Errorf("Not enough data for VRTS chunk: %d/%d", len(data), dataNeeded)
	}

	flags := le.Uint32(data[0:4])
	data = data[4:]

	coordinateCount := le.Uint32(data[4:8])
	if coordinateCount != 0 && coordinateCount != 2 && coordinateCount != 4 {
		return nil, fmt.Errorf("Bad vertex texture coordinates: %d. Expected 0, 2 or 4", coordinateCount)
	}

	v := &Vertices{
		Normals:  (flags & 0x01) != 0,
		Color:    (flags & 0x02) != 0,
		Textures: int(int32(le.Uint32(data[0:4]))),
		DoubleUV: coordinateCount == 4,
	}
	data = data[8:]

	if v.Textures != 0 && coordinateCount == 0 {
		return nil, fmt.Errorf("Bad vertex texture coordinates: %d. Expected 2 or 4", coordinateCount)
	}

	chunkSize := 3*4 + int(v.Textures)*int(coordinateCount)*4
	if v.Normals {
		chunkSize += 3*4
	}
	if v.Color {
		chunkSize += 4*4
	}

	if (len(data) % chunkSize) != 0 {
		return nil, fmt.Errorf("Not enough data for VRTS chunk: %d/%d", len(data) % chunkSize, chunkSize)
	}

	v.Data = make([]float32, len(data) / 4)
	fmt.Println(len(v.Data), v.StrideFloats())
	for i := range v.Data {
		v.Data[i] = math.Float32frombits(le.Uint32(data[0:4]))
		data = data[4:]
	}

	return v, nil
}

func ParseTRISChunk(data []byte) (*Triangles, error) {
	if len(data) < 4 {
		return nil, fmt.Errorf("Not enough data for TRIS chunk: %d/4", len(data))
	}

	t := &Triangles{
		Brush: int(int32(le.Uint32(data[0:4]))),
	}
	data = data[4:]

	if (len(data) & 0x3) != 0 {
		return nil, fmt.Errorf("Misaligned data on a TRIS chunk: %d/4", len(data) & 0x03)
	}

	t.Data = make([]uint32, len(data) / 4)
	for i := range t.Data {
		t.Data[i] = le.Uint32(data[0:4])
		data = data[4:]
	}

	return t, nil
}

func ParseBONEChunk(data []byte) (*Bone, error) {
	if (len(data) & 0x7) != 0 {
		return nil, fmt.Errorf("Misaligned data on a BONE chunk: %d/8", len(data) & 0x07)
	}

	b := &Bone{
		Vertices: make([]uint32, len(data) / 8),
		Weights:  make([]float32, len(data) / 8),
	}

	for i := range b.Vertices {
		b.Vertices[i] = le.Uint32(data[0:4])
		b.Weights[i] = math.Float32frombits(le.Uint32(data[4:8]))
		data = data[8:]
	}

	return b, nil
}

func ParseKEYSChunk(data []byte) ([]Key, error) {
	if len(data) < 4 {
		return nil, fmt.Errorf("Not enough data for KEYS chunk: %d/4", len(data))
	}

	flags := le.Uint32(data[0:4])
	data = data[4:]

	keySize := 1*4

	if (flags & 0x01) != 0 {
		// position
		keySize += 3*4
	}
	if (flags & 0x02) != 0 {
		// scale
		keySize += 3*4
	}
	if (flags & 0x04) != 0 {
		// quaternion
		keySize += 4*4
	}

	keys := make([]Key, len(data) / keySize)
	for i := range keys {
		key := &keys[i]

		key.Frame = le.Uint32(data[0:4])
		data = data[4:]

		if (flags & 0x01) != 0 {
			key.Position[0] = math.Float32frombits(le.Uint32(data[0:4]))
			key.Position[1] = math.Float32frombits(le.Uint32(data[4:8]))
			key.Position[2] = math.Float32frombits(le.Uint32(data[8:12]))
			data = data[12:]
		}

		if (flags & 0x02) != 0 {
			key.Scale[0] = math.Float32frombits(le.Uint32(data[0:4]))
			key.Scale[1] = math.Float32frombits(le.Uint32(data[4:8]))
			key.Scale[2] = math.Float32frombits(le.Uint32(data[8:12]))
			data = data[12:]
		} else {
			key.Scale[0] = 1.0
			key.Scale[1] = 1.0
			key.Scale[2] = 1.0
		}

		if (flags & 0x04) != 0 {
			key.Rotation[0] = math.Float32frombits(le.Uint32(data[0:4]))
			key.Rotation[1] = math.Float32frombits(le.Uint32(data[4:8]))
			key.Rotation[2] = math.Float32frombits(le.Uint32(data[8:12]))
			key.Rotation[3] = math.Float32frombits(le.Uint32(data[12:16]))
			data = data[16:]
		} else {
			key.Rotation[0] = 1.0
		}
	}

	return keys, nil
}

func ParseANIMChunk(data []byte) (*Animation, error) {
	if len(data) < 12 {
		return nil, fmt.Errorf("Not enough data for ANIM chunk: %d/12", len(data))
	}

	a := &Animation{
		Frames: le.Uint32(data[4:8]),
		FPS:    math.Float32frombits(le.Uint32(data[8:12])),
	}

	if a.FPS == 0.0 {
		a.FPS = 60.0
	}

	return a, nil
}

func main() {
	file := readBinary(os.Args[1])
	m, err := ParseModel(file)
	check(err)
	m.Print()
	spew.Dump(m)
}

func readBinary(path string) []byte {
	f, err := os.Open(path)
	check(err)
	defer f.Close()
	d, err := ioutil.ReadAll(f)
	check(err)
	return d
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}
