# /new-mod - Create a New SE Mod Project

## ARGUMENTS

Usage: `/new-mod <description of the mod>`

Examples:
- `/new-mod speed mod` → creates `SpeedMod` project
- `/new-mod auto merge release` → creates `AutoMergeRelease` project
- `/new-mod shield rebalance` → creates `ShieldRebalance` project
- `/new-mod gravity drive fix` → creates `GravityDriveFix` project

The description is interpreted naturally. Convert it to PascalCase for the project name.

---

## WHAT THIS COMMAND DOES

Creates a new Space Engineers mod project under `src/mods/`, ensures you're on a feature branch, scaffolds the project as a Class Library with SE DLL references and Harmony, and verifies the build.

There is NO MDK2 template for mods — this command sets up the project manually following the existing `UMS Mod` pattern.

---

## PROCEDURE

### Step 1: Parse the Name

Take whatever the user typed after `/new-mod` and convert it to a PascalCase project name:
- `speed mod` → `SpeedMod`
- `auto merge release` → `AutoMergeRelease`
- Remove special characters, capitalize each word, join without spaces

Also generate:
- A display name with spaces: `Speed Mod`, `Auto Merge Release`
- A kebab-case version for the branch name: `speed-mod`, `auto-merge-release`

### Step 2: Check Branch

```powershell
git branch --show-current
```

| Current Branch | Action |
|----------------|--------|
| `main` | Switch to develop, create feature branch: `feature/new-mod-{kebab-name}` |
| `develop` | Create feature branch: `feature/new-mod-{kebab-name}` |
| `feature/*` | **Already on a feature branch — proceed without creating a new one** |

**If on `main` or `develop`:**
```powershell
git checkout develop
git pull origin develop
git checkout -b feature/new-mod-{kebab-name}
```

### Step 3: Create the Project Directory

```powershell
mkdir "S:\FastDevelopment\SE\Unity Missile System\src\mods\{DisplayName}"
```

### Step 4: Create the .csproj File

Create `src/mods/{DisplayName}/{PascalName}.csproj` following the UMS Mod pattern:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net48</TargetFramework>
    <AssemblyName>{PascalName}</AssemblyName>
    <RootNamespace>{PascalName}</RootNamespace>
    <LangVersion>latest</LangVersion>
    <OutputType>Library</OutputType>
    <AppendTargetFrameworkToOutputPath>false</AppendTargetFrameworkToOutputPath>
    <CopyLocalLockFileAssemblies>false</CopyLocalLockFileAssemblies>
    <GenerateAssemblyInfo>false</GenerateAssemblyInfo>
    <Version>1.0.0.0</Version>
    <AssemblyVersion>1.0.0.0</AssemblyVersion>
    <FileVersion>1.0.0.0</FileVersion>
    <InformationalVersion>1.0.0.0</InformationalVersion>
    <Product>{DisplayName}</Product>
    <Description>{User's description or a sensible default}</Description>
    <Company>Unity AI Lab</Company>
    <Authors>Unity AI Lab</Authors>
  </PropertyGroup>

  <PropertyGroup>
    <SEBin Condition="'$(SEBin)' == ''">$(SE_BIN_PATH)</SEBin>
    <FindSEPathScript>$(MSBuildThisFileDirectory)..\..\..\tools\find-se-path.ps1</FindSEPathScript>
  </PropertyGroup>

  <Target Name="FindSEPath" BeforeTargets="BeforeResolveReferences;ResolveAssemblyReferences" Condition="'$(SEBin)' == '' Or !Exists('$(SEBin)\Sandbox.Game.dll')">
    <Exec Command="powershell.exe -NoProfile -ExecutionPolicy Bypass -File &quot;$(FindSEPathScript)&quot;"
          ConsoleToMSBuild="true"
          StandardOutputImportance="low"
          IgnoreExitCode="true"
          IgnoreStandardErrorWarningFormat="true">
      <Output TaskParameter="ConsoleOutput" PropertyName="SEBinDetected" />
    </Exec>
    <PropertyGroup>
      <SEBin Condition="'$(SEBinDetected)' != ''">$(SEBinDetected.Trim())</SEBin>
    </PropertyGroup>
    <Error Condition="'$(SEBin)' == '' Or !Exists('$(SEBin)\Sandbox.Game.dll')"
           Text="Space Engineers not found. Install SE via Steam, or set SE_BIN_PATH environment variable to your SE Bin64 folder." />
    <Message Importance="high" Text="Space Engineers found at: $(SEBin)" Condition="Exists('$(SEBin)\Sandbox.Game.dll')" />

    <ItemGroup>
      <Reference Include="Sandbox.Game">
        <HintPath>$(SEBin)\Sandbox.Game.dll</HintPath>
        <Private>false</Private>
      </Reference>
      <Reference Include="Sandbox.Common">
        <HintPath>$(SEBin)\Sandbox.Common.dll</HintPath>
        <Private>false</Private>
      </Reference>
      <Reference Include="VRage">
        <HintPath>$(SEBin)\VRage.dll</HintPath>
        <Private>false</Private>
      </Reference>
      <Reference Include="VRage.Game">
        <HintPath>$(SEBin)\VRage.Game.dll</HintPath>
        <Private>false</Private>
      </Reference>
      <Reference Include="VRage.Library">
        <HintPath>$(SEBin)\VRage.Library.dll</HintPath>
        <Private>false</Private>
      </Reference>
      <Reference Include="VRage.Math">
        <HintPath>$(SEBin)\VRage.Math.dll</HintPath>
        <Private>false</Private>
      </Reference>
    </ItemGroup>
  </Target>

  <ItemGroup Condition="'$(SEBin)' != '' And Exists('$(SEBin)\Sandbox.Game.dll')">
    <Reference Include="Sandbox.Game">
      <HintPath>$(SEBin)\Sandbox.Game.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="Sandbox.Common">
      <HintPath>$(SEBin)\Sandbox.Common.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="VRage">
      <HintPath>$(SEBin)\VRage.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="VRage.Game">
      <HintPath>$(SEBin)\VRage.Game.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="VRage.Library">
      <HintPath>$(SEBin)\VRage.Library.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="VRage.Math">
      <HintPath>$(SEBin)\VRage.Math.dll</HintPath>
      <Private>false</Private>
    </Reference>
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Lib.Harmony" Version="2.4.2" />
  </ItemGroup>
</Project>
```

### Step 5: Create the Entry Point Class

Create `src/mods/{DisplayName}/{PascalName}Main.cs`:

```csharp
using Sandbox.ModAPI;
using VRage.Plugins;

namespace {PascalName}
{
    public class {PascalName}Main : IPlugin
    {
        public void Init(object gameInstance)
        {
        }

        public void Update()
        {
        }

        public void Dispose()
        {
        }
    }
}
```

### Step 6: Verify the Build

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
dotnet build "src/mods/{DisplayName}" -c Debug
```

Must exit code 0 with no errors.

### Step 7: Report

Tell the user:
- Project name and location
- Branch (new or existing)
- Build status
- SE DLL auto-detection status
- Ready for development

---

## RULES

- **ALWAYS follow the UMS Mod .csproj pattern** — SE DLL auto-detection via find-se-path.ps1
- **ALWAYS include Lib.Harmony** — standard for SE mods
- **ALWAYS build and verify** — don't leave a broken project
- **ALWAYS check branch** — respect GitFlow
- **If already on a feature branch, stay on it** — don't create a new one unnecessarily
- **Project goes in src/mods/** — that's where all mod projects live
- **Folder name uses spaces (Display Name), .csproj uses PascalCase** — matches existing `UMS Mod/UMSMod.csproj` convention
- **No MDK2 template exists for mods** — this is a manual scaffolding command

---

*Unity AI Lab*
