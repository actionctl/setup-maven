# Setup Maven CLI Action

This GitHub Action sets up Apache Maven in your workflow environment. It supports automatic version detection, caching, and custom mirror downloads.

## Features
- Installs a specified Maven version or the latest release
- Caches Maven installations in case the tools-cache is available (usually on self-hosted/arc runners)
- Supports custom mirror URLs for Maven downloads

## Inputs
| Name                 | Description                                                                               | Required | Example                                                       |
|----------------------|-------------------------------------------------------------------------------------------|----------|---------------------------------------------------------------|
| maven_version        | The version of Maven to set up. Defaults to the latest version.                           | false    | 3.9.11                                                        |
| download_url_pattern | A mirror url with `{version}` pattern to download `zip` or `tar.gz` maven binary archive. | false    | https://your-mirror.example.com/apache-maven-{version}.tar.gz |

> If `maven_version` is not provided, the action will automatically use the latest stable Maven release.

## Usage
```yaml
- name: Set up Java
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '21'
- name: Setup Maven
  uses: actionctl/setup-maven-cli@v1
  with:
    maven_version: '3.9.11'
```

## Examples

### 1. Downloading Maven from a Custom Mirror

```yaml
- name: Set up Java
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '21'
- name: Setup Maven
  uses: actionctl/setup-maven-cli@v1
  with:
    maven_version: '3.9.11'
    download_url_pattern: 'https://your-mirror.example.com/apache-maven-{version}.tar.gz'
```

This action does not set up Java. Use actions/setup-java to install your preferred JDK before running this action.

### 2. Caching Maven Artifacts

```yaml
- name: Set up Java
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '21'
    cache: 'maven'
- name: Setup Maven
  uses: actionctl/setup-maven-cli@v1
  with:
    maven_version: '3.9.11'
```

Caching Maven artifacts (the local repository) is best handled using the cache option in actions/setup-java for consistency and efficiency.

### 3. Using a Custom settings.xml from Another Repository

```yaml

- name: Checkout settings repo
  uses: actions/checkout@v4
  with:
    repository: your-org/.github
    path: .github-settings

- name: Set up Java
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '21'

- name: Setup Maven
  uses: actionctl/setup-maven-cli@v1
  with:
    maven_version: '3.9.11'

- name: Build with custom settings
  run: mvn -s .github-settings/settings.xml clean install
```

To use a custom settings.xml, check out both your source repo and the repo containing settings.xml. Then pass the path to Maven using the -s option.

## LICENSE
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
